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

function getConfig() {
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
  const databaseId = process.env.CLOUDFLARE_D1_DATABASE_ID;
  const apiToken = process.env.CLOUDFLARE_API_TOKEN;

  if (!accountId || !databaseId || !apiToken) {
    throw new Error(
      "Missing Cloudflare D1 env vars (CLOUDFLARE_ACCOUNT_ID, CLOUDFLARE_D1_DATABASE_ID, CLOUDFLARE_API_TOKEN). See docs/registration-setup.md.",
    );
  }

  return { accountId, databaseId, apiToken };
}

/**
 * Runs a single parameterized SQL statement against D1 and returns its rows.
 */
export async function d1Query<T = Record<string, unknown>>(
  sql: string,
  params: unknown[] = [],
): Promise<T[]> {
  const { accountId, databaseId, apiToken } = getConfig();

  const res = await fetch(
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

  const json = (await res.json()) as D1ApiResponse<T>;

  if (!res.ok || !json.success) {
    const message = json.errors?.map((e) => e.message).join("; ") || res.statusText;
    throw new Error(`D1 query failed: ${message}`);
  }

  return json.result[0]?.results ?? [];
}

/**
 * Runs a single parameterized SQL statement and returns just the first row.
 */
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
