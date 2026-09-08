import { failureKind, type FailureKind } from "@/lib/errors";

// Thin client for the Cloudflare D1 REST API. This app deploys to Vercel,
// not Cloudflare Workers, so we can't use the native D1 binding — every
// query goes over HTTPS instead.

type D1QueryResult<T> = {
  results: T[];
  success: boolean;
  meta: {
    changes: number;
    last_row_id: number;
    rows_read: number;
    rows_written: number;
  };
};

type D1ApiResponse<T> = {
  success: boolean;
  errors: { code: number; message: string }[];
  result: D1QueryResult<T>[];
};

/**
 * Carries enough to identify the failure from a log line alone: which
 * statement, which SQLite error, and whether it's our schema drifting from
 * the code or something transient.
 */
export class D1Error extends Error {
  readonly kind: FailureKind;
  readonly sql: string;
  readonly sqliteCode?: string;

  constructor(message: string, sql: string, options: { cause?: unknown } = {}) {
    super(message, options);
    this.name = "D1Error";
    this.sql = sql;
    this.sqliteCode = message.match(/\b(SQLITE_[A-Z_]+)\b/)?.[1];
    this.kind = failureKind(message);
  }
}

class D1ConfigError extends Error {
  readonly kind: FailureKind = "config";
  constructor(message: string) {
    super(message);
    this.name = "D1ConfigError";
  }
}

/** "INSERT INTO attendees" — the part of a statement worth putting in a log. */
export function describeSql(sql: string): string {
  const flat = sql.trim().replace(/\s+/g, " ");
  const verb = flat.match(/^(SELECT|INSERT(?: OR [A-Z]+)?|UPDATE|DELETE|PRAGMA)\b/i)?.[1];
  if (!verb) return flat.slice(0, 60);
  const table = flat.match(/\b(?:INTO|FROM|UPDATE)\s+"?([A-Za-z_][A-Za-z0-9_]*)"?/i)?.[1];
  return table ? `${verb.toUpperCase()} ${table}` : verb.toUpperCase();
}

function getConfig() {
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
  const databaseId = process.env.CLOUDFLARE_D1_DATABASE_ID;
  const apiToken = process.env.CLOUDFLARE_API_TOKEN;

  if (!accountId || !databaseId || !apiToken) {
    throw new D1ConfigError(
      "Missing Cloudflare D1 env vars (CLOUDFLARE_ACCOUNT_ID, CLOUDFLARE_D1_DATABASE_ID, CLOUDFLARE_API_TOKEN). See docs/registration-setup.md.",
    );
  }

  return { accountId, databaseId, apiToken };
}

export async function d1Query<T = Record<string, unknown>>(
  sql: string,
  params: unknown[] = [],
): Promise<T[]> {
  const { accountId, databaseId, apiToken } = getConfig();
  const statement = describeSql(sql);

  let res: Response;
  try {
    res = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${accountId}/d1/database/${databaseId}/query`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ sql, params }),
      },
    );
  } catch (cause) {
    // Never reached D1 at all — worth separating from a query D1 rejected,
    // because only one of the two is retryable.
    throw new D1Error(
      `D1 unreachable during ${statement}: ${cause instanceof Error ? cause.message : "fetch failed"}`,
      statement,
      { cause },
    );
  }

  const json = (await res.json().catch(() => null)) as D1ApiResponse<T> | null;

  if (!res.ok || !json?.success) {
    const message =
      json?.errors?.map((e) => e.message).join("; ") || `HTTP ${res.status} ${res.statusText}`;
    throw new D1Error(`${statement} failed: ${message}`, statement);
  }

  return json.result[0]?.results ?? [];
}

export async function d1QueryOne<T = Record<string, unknown>>(
  sql: string,
  params: unknown[] = [],
): Promise<T | null> {
  const rows = await d1Query<T>(sql, params);
  return rows[0] ?? null;
}

/**
 * Runs multiple statements sequentially. D1's REST API has no true
 * cross-statement transaction over HTTP, so this is best-effort ordering,
 * not atomicity — callers that need atomicity should design around it
 * (e.g. write the "parent" row last, or reconcile on read).
 */
export async function d1Batch(statements: { sql: string; params?: unknown[] }[]) {
  for (const { sql, params = [] } of statements) {
    await d1Query(sql, params);
  }
}
