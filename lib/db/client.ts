import { drizzle } from "drizzle-orm/sqlite-proxy";

import { d1RestExecute } from "@/lib/db/d1RestClient";

// D1's REST API returns rows as `{column: value}` objects; drizzle's
// sqlite-proxy driver wants each row as a plain values array, positioned to
// match the query's selected columns. D1 (like SQLite) builds those objects
// in column order, so Object.values(row) lines back up correctly — this is
// the same trick drizzle-orm/d1's own native-binding driver uses.
export const db = drizzle(async (sql, params, method): Promise<{ rows: unknown[] }> => {
  const results = await d1RestExecute<Record<string, unknown>>(sql, params);

  if (method === "get") {
    const row = results[0];
    // sqlite-proxy's `get` contract treats a falsy `rows` as "no row found",
    // so an empty array (truthy) would be mistaken for an empty match.
    return { rows: (row ? Object.values(row) : undefined) as unknown[] };
  }

  return { rows: results.map((row) => Object.values(row)) };
});
