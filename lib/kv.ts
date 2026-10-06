// Shared, fast state that D1 is the wrong place for: rate-limit counters, the
// waiting room, short locks. Backed by Upstash Redis over its REST API when
// it's configured (Vercel Marketplace → Upstash sets the KV_REST_API_* vars),
// and by process memory otherwise — which is right for local development and
// a reasonable per-instance fallback for rate limits, but not for anything
// that must be shared between instances (see `isShared`).

type Command = (string | number)[];

const TIMEOUT_MS = 2_000;

function redisConfig(): { url: string; token: string } | null {
  const url = process.env.UPSTASH_REDIS_REST_URL ?? process.env.KV_REST_API_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN ?? process.env.KV_REST_API_TOKEN;
  return url && token ? { url: url.replace(/\/+$/, ""), token } : null;
}

export class KvError extends Error {
  constructor(message: string, options: { cause?: unknown } = {}) {
    super(message, options);
    this.name = "KvError";
  }
}

async function redis<T>(path: "" | "/pipeline", body: Command | Command[]): Promise<T> {
  const config = redisConfig();
  if (!config) throw new KvError("Redis is not configured");

  let res: Response;
  try {
    res = await fetch(`${config.url}${path}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${config.token}`, "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(TIMEOUT_MS),
      cache: "no-store",
    });
  } catch (cause) {
    throw new KvError("Redis unreachable", { cause });
  }

  const json = (await res.json().catch(() => null)) as unknown;
  if (!res.ok || json === null) {
    throw new KvError(`Redis HTTP ${res.status}: ${JSON.stringify(json)?.slice(0, 200)}`);
  }

  if (path === "/pipeline") {
    const items = json as { result?: unknown; error?: string }[];
    const failed = items.find((item) => item.error);
    if (failed) throw new KvError(`Redis: ${failed.error}`);
    return items.map((item) => item.result) as T;
  }

  const single = json as { result?: unknown; error?: string };
  if (single.error) throw new KvError(`Redis: ${single.error}`);
  return single.result as T;
}

// ─── memory backend ─────────────────────────────────────────────────────────

type MemoryValue = { value: string; expiresAt: number | null };
const memory = new Map<string, MemoryValue>();

function memoryGet(key: string): MemoryValue | null {
  const hit = memory.get(key);
  if (!hit) return null;
  if (hit.expiresAt !== null && hit.expiresAt <= Date.now()) {
    memory.delete(key);
    return null;
  }
  return hit;
}

// Keep a long-running dev server from accumulating dead counters.
let lastSweep = 0;
function sweep() {
  const now = Date.now();
  if (now - lastSweep < 60_000) return;
  lastSweep = now;
  for (const [key, hit] of memory) {
    if (hit.expiresAt !== null && hit.expiresAt <= now) memory.delete(key);
  }
}

// ─── public api ─────────────────────────────────────────────────────────────

export const kv = {
  get kind(): "redis" | "memory" {
    return redisConfig() ? "redis" : "memory";
  },

  get isShared(): boolean {
    return redisConfig() !== null;
  },

  async incrWindow(key: string, windowSec: number): Promise<number> {
    if (redisConfig()) {
      // SET NX creates the window with its expiry; INCR keeps that expiry.
      const [, count] = await redis<[string | null, number]>("/pipeline", [
        ["SET", key, 0, "EX", windowSec, "NX"],
        ["INCR", key],
      ]);
      return count;
    }

    sweep();
    const hit = memoryGet(key);
    const next = (hit ? Number(hit.value) : 0) + 1;
    memory.set(key, {
      value: String(next),
      expiresAt: hit?.expiresAt ?? Date.now() + windowSec * 1000,
    });
    return next;
  },

  async setNx(key: string, value: string, ttlSec: number): Promise<boolean> {
    if (redisConfig()) {
      const result = await redis<string | null>("", ["SET", key, value, "NX", "EX", ttlSec]);
      return result === "OK";
    }

    sweep();
    if (memoryGet(key)) return false;
    memory.set(key, { value, expiresAt: Date.now() + ttlSec * 1000 });
    return true;
  },

  async get(key: string): Promise<string | null> {
    if (redisConfig()) return redis<string | null>("", ["GET", key]);
    return memoryGet(key)?.value ?? null;
  },

  async del(key: string): Promise<void> {
    if (redisConfig()) {
      await redis("", ["DEL", key]);
      return;
    }
    memory.delete(key);
  },

  async eval<T>(script: string, keys: string[], args: (string | number)[]): Promise<T> {
    return redis<T>("", ["EVAL", script, keys.length, ...keys, ...args]);
  },
};
