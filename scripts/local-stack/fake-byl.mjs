// Local stand-in for Byl. Creates checkouts and invoices, serves a pay page
// that sends the signed `checkout.completed` webhook to the app and then
// redirects to the success URL — the whole payment loop, offline.
//
//   SITE=http://localhost:3000 BYL_WEBHOOK_SECRET=local-test-secret node scripts/local-stack/fake-byl.mjs
import { createHmac } from "node:crypto";
import http from "node:http";

const PORT = Number(process.env.PORT ?? 8788);
const SITE = process.env.SITE ?? "http://localhost:3000";
const SECRET = process.env.BYL_WEBHOOK_SECRET ?? "local-test-secret";
const SELF = `http://127.0.0.1:${PORT}`;

let nextId = 1000;
const checkouts = new Map();

function json(res, status, body) {
  res.writeHead(status, { "content-type": "application/json" });
  res.end(JSON.stringify(body));
}

async function sendWebhook(checkout) {
  const body = JSON.stringify({
    id: Date.now(),
    project_id: 1,
    type: "checkout.completed",
    object: "event",
    data: { object: { ...checkout, status: "complete" } },
    created_at: new Date().toISOString(),
  });
  const signature = createHmac("sha256", SECRET).update(body).digest("hex");
  const res = await fetch(`${SITE}/api/registration/byl-webhook`, {
    method: "POST",
    headers: { "content-type": "application/json", "byl-signature": signature },
    body,
  });
  console.log(`webhook for checkout ${checkout.id}: ${res.status}`);
}

http
  .createServer(async (req, res) => {
    let body = "";
    for await (const chunk of req) body += chunk;
    let m;

    if (req.method === "POST" && /\/checkouts$/.test(req.url)) {
      const input = JSON.parse(body);
      const total = input.items.reduce((sum, i) => sum + i.price_data.unit_amount * i.quantity, 0);
      const checkout = {
        id: ++nextId,
        url: `${SELF}/pay/${nextId}`,
        status: "open",
        amount_total: String(total),
        client_reference_id: input.client_reference_id,
        success_url: input.success_url,
        cancel_url: input.cancel_url,
      };
      checkouts.set(String(checkout.id), checkout);
      return json(res, 200, { data: checkout });
    }

    if (req.method === "POST" && /\/invoices$/.test(req.url)) {
      return json(res, 200, { data: { id: ++nextId, url: `${SELF}/invoice/${nextId}`, status: "open" } });
    }

    if (req.method === "GET" && (m = req.url.match(/\/checkouts\/(\d+)$/))) {
      return json(res, 200, { data: checkouts.get(m[1]) ?? { status: "open" } });
    }

    if (req.method === "GET" && (m = req.url.match(/^\/pay\/(\d+)$/))) {
      const checkout = checkouts.get(m[1]);
      res.writeHead(200, { "content-type": "text/html; charset=utf-8" });
      return res.end(`<!doctype html><meta name=viewport content="width=device-width">
        <body style="font-family:system-ui;max-width:420px;margin:48px auto;padding:0 16px">
        <h1>Fake Byl</h1><p>Checkout ${m[1]} — ${checkout?.amount_total ?? "?"}₮</p>
        <form method=post action="/pay/${m[1]}/complete"><button style="font-size:18px;padding:12px 20px">Pay</button></form>
        <p><a href="${checkout?.cancel_url ?? SITE}">Cancel</a></p></body>`);
    }

    if (req.method === "POST" && (m = req.url.match(/^\/pay\/(\d+)\/complete$/))) {
      const checkout = checkouts.get(m[1]);
      if (!checkout) return json(res, 404, {});
      checkout.status = "complete";
      await sendWebhook(checkout).catch((e) => console.error("webhook failed", e.message));
      res.writeHead(303, { location: checkout.success_url });
      return res.end();
    }

    json(res, 404, {});
  })
  .listen(PORT, () => console.log(`fake byl on ${SELF}, webhooks to ${SITE}`));
