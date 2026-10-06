// Local stand-in for Cloudflare's D1 REST API, backed by node:sqlite, so the
// whole registration flow can run without touching the real database.
// Batches run inside a transaction, like D1. To rehearse D1's rate limit,
// set FAKE_D1_BUDGET=<requests per 10s> and it answers 429 past that.
//
//   DB_PATH=.local/d1.sqlite node scripts/local-stack/fake-d1.mjs
import http from "node:http";
import fs from "node:fs";
import { DatabaseSync } from "node:sqlite";

const PORT = Number(process.env.PORT ?? 8787);
const DB_PATH = process.env.DB_PATH ?? ":memory:";
const ROOT = process.env.REPO ?? process.cwd();
const BUDGET = Number(process.env.FAKE_D1_BUDGET ?? 0);
const LATENCY = Number(process.env.FAKE_D1_LATENCY ?? 30);

const db = new DatabaseSync(DB_PATH);
db.exec(fs.readFileSync(`${ROOT}/db/schema.sql`, "utf8"));

let windowStart = Date.now(), used = 0, total = 0, limited = 0;

function exec(sql, params = []) {
  const stmt = db.prepare(sql);
  const rows = stmt.all(...params.map((p) => (typeof p === "boolean" ? Number(p) : p)));
  const isRead = /^\s*(SELECT|WITH)\b/i.test(sql);
  const changes = isRead ? 0 : db.prepare("SELECT changes() AS c").get().c;
  return { results: rows, success: true, meta: { changes, last_row_id: 0, rows_read: 0, rows_written: changes } };
}

const server = http.createServer(async (req, res) => {
  if (req.url === "/__stats") {
    res.end(JSON.stringify({ total, limited }));
    return;
  }
  // Ad-hoc inspection: curl -X POST localhost:8787/__sql -d "SELECT ..."
  if (req.url === "/__sql" && req.method === "POST") {
    let body = ""; for await (const c of req) body += c;
    try { res.end(JSON.stringify(db.prepare(body).all())); } catch (e) { res.statusCode = 400; res.end(String(e)); }
    return;
  }
  let body = "";
  for await (const chunk of req) body += chunk;
  total++;
  if (BUDGET) {
    if (Date.now() - windowStart > 10_000) { windowStart = Date.now(); used = 0; }
    if (++used > BUDGET) {
      limited++;
      res.writeHead(429, { "content-type": "application/json", "retry-after": "1" });
      res.end(JSON.stringify({ success: false, errors: [{ code: 971, message: "rate limited" }] }));
      return;
    }
  }
  await new Promise((r) => setTimeout(r, LATENCY));
  const payload = JSON.parse(body);
  try {
    let result;
    if (payload.batch) {
      db.exec("BEGIN");
      try {
        result = payload.batch.map((s) => exec(s.sql, s.params));
        db.exec("COMMIT");
      } catch (e) {
        db.exec("ROLLBACK");
        throw e;
      }
    } else {
      result = [exec(payload.sql, payload.params)];
    }
    res.writeHead(200, { "content-type": "application/json" });
    res.end(JSON.stringify({ success: true, errors: [], messages: [], result }));
  } catch (e) {
    res.writeHead(400, { "content-type": "application/json" });
    res.end(JSON.stringify({ success: false, errors: [{ code: 7500, message: `${e.message}: SQLITE_ERROR` }], result: [] }));
  }
});
server.listen(PORT, () => console.log(`fake d1 on ${PORT}`));
