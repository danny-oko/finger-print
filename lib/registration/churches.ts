import { v4 as uuid } from "uuid";

import { cached } from "@/lib/cache";
import { d1Query, d1Run } from "@/lib/db/d1";

const MAX_CHURCHES = 500;

export const listChurches = cached(60_000, async () => {
  const rows = await d1Query<{ name: string }>(
    "SELECT name FROM churches ORDER BY name LIMIT ?",
    [MAX_CHURCHES],
  );
  return rows.map((r) => r.name);
});

export async function addChurch(name: string): Promise<void> {
  const { changes } = await d1Run(
    "INSERT OR IGNORE INTO churches (id, name, created_at) VALUES (?, ?, ?)",
    [uuid(), name, new Date().toISOString()],
  );
  if (changes > 0) listChurches.invalidate();
}
