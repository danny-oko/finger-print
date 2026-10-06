import { failureKind, type FailureKind } from "@/lib/errors";
import { createLimiter } from "@/lib/server/limiter";

// The one client for Cloudflare D1. This app runs on Vercel, not Workers, so
// every query is an HTTPS call to D1's REST API — and that API sits behind
// Cloudflare's account-wide limit of 1,200 requests per 5 minutes. Under a
// registration rush that limit, not SQLite, is what runs out first, so this
// client is built around spending fewer requests: batches go out as one
// call, a burst is capped per instance, and a 429 is waited out instead of
// surfacing as an error.

type D1Meta = {
  changes: number;
  last_row_id: number;
  rows_read: number;
  rows_written: number;
};

type D1StatementResponse<T> = {
  results: T[];
  success: boolean;
  meta: D1Meta;
};

type D1ApiResponse<T> = {
  success: boolean;
  errors: { code: number; message: string }[];
  result: D1StatementResponse<T>[];
};

export type D1Statement = { sql: string; params?: unknown[] };

export type D1Result<T = Record<string, unknown>> = {
  rows: T[];
  changes: number;
};

export class D1Error extends Error {
  readonly kind: FailureKind;
  readonly sql: string;
  readonly sqliteCode?: string;
  readonly status?: number;

  constructor(
    message: string,
    sql: string,
    options: { cause?: unknown; status?: number; kind?: FailureKind } = {},
  ) {
    super(message, { cause: options.cause });
    this.name = "D1Error";
    this.sql = sql;
    this.status = options.status;
    this.sqliteCode = message.match(/\b(SQLITE_[A-Z_]+)\b/)?.[1];
    this.kind = options.kind ?? failureKind(message);
  }
}

export function describeSql(sql: string): string {
  const flat = sql.trim().replace(/\s+/g, " ");
  const verb = flat.match(/^(SELECT|INSERT(?: OR [A-Z]+)?|UPDATE|DELETE|PRAGMA|WITH)\b/i)?.[1];
  if (!verb) return flat.slice(0, 60);
  const table = flat.match(/\b(?:INTO|FROM|UPDATE)\s+"?([A-Za-z_][A-Za-z0-9_]*)"?/i)?.[1];
  return table ? `${verb.toUpperCase()} ${table}` : verb.toUpperCase();
}

function getConfig() {
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
  const databaseId = process.env.CLOUDFLARE_D1_DATABASE_ID;
  const apiToken = process.env.CLOUDFLARE_API_TOKEN;

  if (!accountId || !databaseId || !apiToken) {
    throw new D1Error(
      "Missing Cloudflare D1 env vars (CLOUDFLARE_ACCOUNT_ID, CLOUDFLARE_D1_DATABASE_ID, CLOUDFLARE_API_TOKEN). See docs/registration-setup.md.",
      "config",
      { kind: "config" },
    );
  }

  // Overridable so the whole stack can run against a local stand-in.
  const base = (process.env.D1_API_BASE_URL ?? "https://api.cloudflare.com/client/v4").replace(
    /\/+$/,
    "",
  );

  return {
    url: `${base}/accounts/${accountId}/d1/database/${databaseId}/query`,
    apiToken,
  };
}

// Per instance. Fluid compute serves many requests from one instance, and
// without a cap a burst of them would each open their own D1 call at once —
// spending the shared rate limit in a single second.
const MAX_CONCURRENT = 8;
const REQUEST_TIMEOUT_MS = 10_000;
const MAX_ATTEMPTS = 4;

const limit = createLimiter(MAX_CONCURRENT);

let rateLimitedAt = 0;

export function isD1UnderPressure(windowMs = 10_000): boolean {
  return Date.now() - rateLimitedAt < windowMs;
}

function backoffMs(attempt: number, retryAfter: string | null): number {
  const hinted = Number(retryAfter);
  if (Number.isFinite(hinted) && hinted > 0) return Math.min(hinted * 1000, 8000);
  const base = 250 * 2 ** attempt;
  return base / 2 + Math.random() * base;
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function send<T>(
  body: unknown,
  label: string,
  retryable: boolean,
): Promise<D1StatementResponse<T>[]> {
  const { url, apiToken } = getConfig();

  for (let attempt = 0; ; attempt++) {
    const last = attempt === MAX_ATTEMPTS - 1;
    let res: Response;

    try {
      res = await limit(() =>
        fetch(url, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(body),
          signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
          cache: "no-store",
        }),
      );
    } catch (cause) {
      if (!last && retryable) {
        await sleep(backoffMs(attempt, null));
        continue;
      }
      throw new D1Error(
        `D1 unreachable during ${label}: ${cause instanceof Error ? cause.message : "fetch failed"}`,
        label,
        { cause, kind: "network" },
      );
    }

    if (res.status === 429) {
      rateLimitedAt = Date.now();
      console.warn(`[d1] rate limited during ${label} (attempt ${attempt + 1})`);
      if (!last) {
        await sleep(backoffMs(attempt, res.headers.get("retry-after")));
        continue;
      }
      throw new D1Error(`${label} failed: HTTP 429 rate limited`, label, {
        status: 429,
        kind: "network",
      });
    }

    if (res.status >= 500 && !last && retryable) {
      await sleep(backoffMs(attempt, res.headers.get("retry-after")));
      continue;
    }

    const json = (await res.json().catch(() => null)) as D1ApiResponse<T> | null;

    if (!res.ok || !json?.success) {
      const message =
        json?.errors?.map((e) => e.message).join("; ") || `HTTP ${res.status} ${res.statusText}`;
      throw new D1Error(`${label} failed: ${message}`, label, { status: res.status });
    }

    return json.result;
  }
}

const isRead = (sql: string) => /^\s*(SELECT|WITH)\b/i.test(sql);

export async function d1Query<T = Record<string, unknown>>(
  sql: string,
  params: unknown[] = [],
): Promise<T[]> {
  const [result] = await send<T>({ sql, params }, describeSql(sql), isRead(sql));
  return result?.results ?? [];
}

export async function d1QueryOne<T = Record<string, unknown>>(
  sql: string,
  params: unknown[] = [],
): Promise<T | null> {
  const rows = await d1Query<T>(sql, params);
  return rows[0] ?? null;
}

export async function d1Run<T = Record<string, unknown>>(
  sql: string,
  params: unknown[] = [],
): Promise<D1Result<T>> {
  const [result] = await send<T>({ sql, params }, describeSql(sql), false);
  return { rows: result?.results ?? [], changes: result?.meta?.changes ?? 0 };
}

// One request, one transaction. `idempotent` allows a retry after a dropped
// connection, so only pass it when every statement is guarded against re-running.
export async function d1Batch<T = Record<string, unknown>>(
  statements: D1Statement[],
  { idempotent = false }: { idempotent?: boolean } = {},
): Promise<D1Result<T>[]> {
  if (statements.length === 0) return [];

  const label = `batch(${statements.map((s) => describeSql(s.sql)).join(", ")})`;
  const results = await send<T>(
    { batch: statements.map(({ sql, params = [] }) => ({ sql, params })) },
    label,
    idempotent || statements.every((s) => isRead(s.sql)),
  );

  return results.map((r) => ({ rows: r.results ?? [], changes: r.meta?.changes ?? 0 }));
}

export function placeholders(count: number): string {
  return Array.from({ length: count }, () => "?").join(", ");
}
