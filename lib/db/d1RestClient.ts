import { AxiosError } from "axios";

import { D1Error, describeSql } from "@/lib/d1";
import { secureHttp } from "@/lib/http/axios";

// Drizzle's query layer for this table set — see ./client.ts. Kept separate
// from lib/d1.ts (the raw client the existing payment/lookup routes use) so
// the working payment path isn't touched by this.
type D1QueryResult<T> = {
  results: T[];
  success: boolean;
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
    throw new D1Error(
      "Missing Cloudflare D1 env vars (CLOUDFLARE_ACCOUNT_ID, CLOUDFLARE_D1_DATABASE_ID, CLOUDFLARE_API_TOKEN). See docs/registration-setup.md.",
      "config",
    );
  }

  return { accountId, databaseId, apiToken };
}

/**
 * Executes one parameterized statement against D1's REST API via the shared
 * axios instance and returns its rows as plain objects (column -> value).
 */
export async function d1RestExecute<T = Record<string, unknown>>(
  sql: string,
  params: unknown[] = [],
): Promise<T[]> {
  const { accountId, databaseId, apiToken } = getConfig();
  const statement = describeSql(sql);

  try {
    const { data } = await secureHttp.post<D1ApiResponse<T>>(
      `https://api.cloudflare.com/client/v4/accounts/${accountId}/d1/database/${databaseId}/query`,
      { sql, params },
      { headers: { Authorization: `Bearer ${apiToken}` } },
    );

    if (!data.success) {
      const message = data.errors?.map((e) => e.message).join("; ") || "unknown error";
      throw new D1Error(`${statement} failed: ${message}`, statement);
    }

    return data.result[0]?.results ?? [];
  } catch (error) {
    if (error instanceof AxiosError) {
      const message =
        error.response?.data?.errors?.map((e: { message: string }) => e.message).join("; ") ??
        error.message;
      throw new D1Error(`${statement} failed: ${message}`, statement, { cause: error });
    }
    throw error;
  }
}
