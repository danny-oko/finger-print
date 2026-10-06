import { randomBytes } from "node:crypto";

import { kv } from "@/lib/kv";
import {
  queueSecret,
  readToken,
  signToken,
  type PassClaims,
  type TicketClaims,
} from "@/lib/queue/token";
import { getRegistrationSettings } from "@/lib/registration/settings";

// A virtual waiting room in front of the one expensive step: saving a
// registration and opening its payment page. Each save costs D1 and Byl
// requests that are rate-limited account-wide, so when several hundred
// people press "pay" in the same minute they're let through at a steady
// rate instead of all at once — and told their place in line meanwhile.
//
// Admission is a token bucket: `burst` people can go straight through, then
// `admitPerMinute` more per minute. When the room is quiet nobody sees it.
// People who close the tab stop polling and drop out after GHOST_MS, so the
// line never stalls behind them.

const GHOST_MS = 90_000;
const PASS_MS = 10 * 60_000;
const TICKET_MAX_AGE_MS = 3 * 60 * 60_000;

const KEYS = {
  wait: "fp:wr:wait",
  seen: "fp:wr:seen",
  admitted: "fp:wr:adm",
  bucket: "fp:wr:bucket",
  seq: "fp:wr:seq",
};

export type QueueBackend = "redis" | "memory";

export type QueueConfig =
  | { active: false; reason: "disabled" | "no_secret" | "no_shared_store" }
  | { active: true; backend: QueueBackend; admitPerMinute: number; burst: number };

export async function getQueueConfig(): Promise<QueueConfig> {
  const { queue } = await getRegistrationSettings();
  if (queue.mode === "off") return { active: false, reason: "disabled" };
  if (!queueSecret()) return { active: false, reason: "no_secret" };

  // Memory only works when every request lands on the same process — true
  // for `next dev`, not for a production deployment.
  if (!kv.isShared && process.env.NODE_ENV === "production" && process.env.QUEUE_ALLOW_MEMORY !== "1") {
    return { active: false, reason: "no_shared_store" };
  }

  return { active: true, backend: kv.kind, admitPerMinute: queue.admitPerMinute, burst: queue.burst };
}

export type QueueState =
  | { state: "admitted"; pass: string; expiresAt: number }
  | { state: "waiting"; ticket: string; position: number; total: number; etaSec: number }
  | { state: "expired" };

type Step = { admittedUntil: number | null; position: number; total: number; n: number };

type Mode = "join" | "poll" | "leave";

type Params = {
  mode: Mode;
  id: string;
  n: number;
  now: number;
  ratePerMs: number;
  burst: number;
};

// ─── redis backend ──────────────────────────────────────────────────────────

export const QUEUE_SCRIPT = `
local wait, seen, adm, bucket, seq = KEYS[1], KEYS[2], KEYS[3], KEYS[4], KEYS[5]
local now = tonumber(ARGV[1])
local rate = tonumber(ARGV[2])
local burst = tonumber(ARGV[3])
local ghost = tonumber(ARGV[4])
local passMs = tonumber(ARGV[5])
local mode = ARGV[6]
local id = ARGV[7]
local n = tonumber(ARGV[8])

if mode == 'leave' then
  redis.call('ZREM', wait, id)
  redis.call('ZREM', seen, id)
  redis.call('ZREM', adm, id)
  return {0, 0, 0, 0}
end

if mode == 'join' then
  n = redis.call('INCR', seq)
  redis.call('ZADD', wait, n, id)
  redis.call('ZADD', seen, now, id)
elseif not redis.call('ZSCORE', adm, id) then
  redis.call('ZADD', wait, 'NX', n, id)
  redis.call('ZADD', seen, now, id)
end

local gone = redis.call('ZRANGEBYSCORE', seen, '-inf', now - ghost, 'LIMIT', 0, 500)
for _, ghostId in ipairs(gone) do
  redis.call('ZREM', wait, ghostId)
  redis.call('ZREM', seen, ghostId)
end
redis.call('ZREMRANGEBYSCORE', adm, '-inf', now)

local b = redis.call('HMGET', bucket, 'tokens', 'at')
local tokens = tonumber(b[1]) or burst
local at = tonumber(b[2]) or now
tokens = math.min(burst, tokens + math.max(0, now - at) * rate)

local admit = math.floor(tokens)
if admit > 0 then
  local popped = redis.call('ZPOPMIN', wait, admit)
  for i = 1, #popped, 2 do
    redis.call('ZADD', adm, now + passMs, popped[i])
    redis.call('ZREM', seen, popped[i])
    tokens = tokens - 1
  end
end
redis.call('HSET', bucket, 'tokens', tostring(tokens), 'at', tostring(now))

local admittedUntil = redis.call('ZSCORE', adm, id)
local total = redis.call('ZCARD', wait)
if admittedUntil then
  return {1, tonumber(admittedUntil), total, n}
end
local rank = redis.call('ZRANK', wait, id)
return {0, rank and (rank + 1) or 0, total, n}
`;

async function redisStep(p: Params): Promise<Step> {
  const [admitted, value, total, n] = await kv.eval<[number, number, number, number]>(
    QUEUE_SCRIPT,
    [KEYS.wait, KEYS.seen, KEYS.admitted, KEYS.bucket, KEYS.seq],
    [p.now, p.ratePerMs, p.burst, GHOST_MS, PASS_MS, p.mode, p.id, p.n],
  );
  return admitted === 1
    ? { admittedUntil: value, position: 0, total, n }
    : { admittedUntil: null, position: value, total, n };
}

// ─── memory backend (same algorithm, for one process) ───────────────────────

const room = {
  seq: 0,
  wait: new Map<string, number>(),
  seen: new Map<string, number>(),
  admitted: new Map<string, number>(),
  bucket: null as { tokens: number; at: number } | null,
};

function memoryStep(p: Params): Step {
  if (p.mode === "leave") {
    room.wait.delete(p.id);
    room.seen.delete(p.id);
    room.admitted.delete(p.id);
    return { admittedUntil: null, position: 0, total: room.wait.size, n: 0 };
  }

  let n = p.n;
  if (p.mode === "join") {
    n = ++room.seq;
    room.wait.set(p.id, n);
    room.seen.set(p.id, p.now);
  } else if (!room.admitted.has(p.id)) {
    if (!room.wait.has(p.id)) room.wait.set(p.id, p.n);
    room.seen.set(p.id, p.now);
  }

  for (const [id, seenAt] of room.seen) {
    if (seenAt <= p.now - GHOST_MS) {
      room.wait.delete(id);
      room.seen.delete(id);
    }
  }
  for (const [id, until] of room.admitted) if (until <= p.now) room.admitted.delete(id);

  const bucket = room.bucket ?? { tokens: p.burst, at: p.now };
  bucket.tokens = Math.min(p.burst, bucket.tokens + Math.max(0, p.now - bucket.at) * p.ratePerMs);
  bucket.at = p.now;

  const admit = Math.floor(bucket.tokens);
  if (admit > 0) {
    const next = [...room.wait].sort((a, b) => a[1] - b[1]).slice(0, admit);
    for (const [id] of next) {
      room.wait.delete(id);
      room.seen.delete(id);
      room.admitted.set(id, p.now + PASS_MS);
      bucket.tokens -= 1;
    }
  }
  room.bucket = bucket;

  const admittedUntil = room.admitted.get(p.id) ?? null;
  if (admittedUntil) return { admittedUntil, position: 0, total: room.wait.size, n };

  const mine = room.wait.get(p.id);
  const position =
    mine === undefined ? 0 : [...room.wait.values()].filter((n) => n < mine).length + 1;
  return { admittedUntil: null, position, total: room.wait.size, n };
}

export function resetMemoryRoom() {
  room.seq = 0;
  room.wait.clear();
  room.seen.clear();
  room.admitted.clear();
  room.bucket = null;
}

// ─── public api ─────────────────────────────────────────────────────────────

async function step(
  config: Extract<QueueConfig, { active: true }>,
  mode: Mode,
  id: string,
  n = 0,
): Promise<Step> {
  const params: Params = {
    mode,
    id,
    n,
    now: Date.now(),
    ratePerMs: config.admitPerMinute / 60_000,
    burst: config.burst,
  };
  return config.backend === "redis" ? redisStep(params) : memoryStep(params);
}

function passFor(id: string, expiresAt: number): QueueState {
  return {
    state: "admitted",
    pass: signToken<PassClaims>({ k: "pass", id, exp: expiresAt }),
    expiresAt,
  };
}

function toState(
  config: Extract<QueueConfig, { active: true }>,
  result: Step,
  id: string,
  iat: number,
): QueueState {
  if (result.admittedUntil) return passFor(id, result.admittedUntil);
  if (result.position === 0) return { state: "expired" };

  return {
    state: "waiting",
    ticket: signToken<TicketClaims>({ k: "ticket", id, n: result.n, iat }),
    position: result.position,
    total: result.total,
    // Rounded up to whole 10s steps: an ETA that ticks every second reads as
    // more precise than it is.
    etaSec: Math.ceil((result.position / config.admitPerMinute) * 6) * 10,
  };
}

function failOpen(error: unknown): QueueState {
  console.error("[queue] store unavailable, admitting", error);
  const id = randomBytes(9).toString("base64url");
  return passFor(id, Date.now() + PASS_MS);
}

export async function joinQueue(): Promise<QueueState | { state: "inactive" }> {
  const config = await getQueueConfig();
  if (!config.active) return { state: "inactive" };

  const id = randomBytes(9).toString("base64url");
  try {
    return toState(config, await step(config, "join", id), id, Date.now());
  } catch (error) {
    return failOpen(error);
  }
}

export async function pollQueue(ticket: unknown): Promise<QueueState | { state: "inactive" }> {
  const config = await getQueueConfig();
  if (!config.active) return { state: "inactive" };

  const claims = readToken<TicketClaims>(ticket);
  if (claims?.k !== "ticket" || Date.now() - claims.iat > TICKET_MAX_AGE_MS) {
    return { state: "expired" };
  }

  try {
    return toState(config, await step(config, "poll", claims.id, claims.n), claims.id, claims.iat);
  } catch (error) {
    return failOpen(error);
  }
}

export async function leaveQueue(ticket: unknown): Promise<void> {
  const config = await getQueueConfig();
  const claims = readToken<TicketClaims | PassClaims>(ticket);
  if (!config.active || !claims) return;
  await step(config, "leave", claims.id).catch(() => {});
}

export type PassCheck = { ok: true } | { ok: false; reason: "missing" | "invalid" | "used" };

// A pass is bound to the first submission key that uses it: retrying that
// submission is fine, reusing the pass for another one isn't.
export async function checkPass(pass: string | null, idempotencyKey?: string): Promise<PassCheck> {
  const config = await getQueueConfig();
  if (!config.active) return { ok: true };
  if (!pass) return { ok: false, reason: "missing" };

  const claims = readToken<PassClaims>(pass);
  if (claims?.k !== "pass" || claims.exp < Date.now()) return { ok: false, reason: "invalid" };

  const key = `fp:wr:used:${claims.id}`;
  const owner = idempotencyKey ?? "anonymous";
  try {
    const ttl = Math.ceil((claims.exp - Date.now()) / 1000) + 60;
    if (await kv.setNx(key, owner, ttl)) return { ok: true };
    return (await kv.get(key)) === owner ? { ok: true } : { ok: false, reason: "used" };
  } catch (error) {
    console.error("[queue] could not record pass use, allowing", error);
    return { ok: true };
  }
}

export type QueueStats = { waiting: number; admitted: number };

export async function getQueueStats(): Promise<QueueStats | null> {
  const config = await getQueueConfig();
  if (!config.active) return null;

  if (config.backend === "memory") {
    return { waiting: room.wait.size, admitted: room.admitted.size };
  }

  const [waiting, admitted] = await kv.eval<[number, number]>(
    "return {redis.call('ZCARD', KEYS[1]), redis.call('ZCOUNT', KEYS[2], ARGV[1], '+inf')}",
    [KEYS.wait, KEYS.admitted],
    [Date.now()],
  );
  return { waiting, admitted };
}
