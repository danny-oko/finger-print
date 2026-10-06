import { NextResponse } from "next/server";

import { kv } from "@/lib/kv";

export type RateLimitRule = {
  name: string;
  limit: number;
  windowSec: number;
};

export const RATE_LIMITS = {
  // Per IP, and a whole church on one Wi-Fi — or a carrier's NAT — can share
  // an IP, so these are set to stop scripts, not groups of people.
  //
  // A phone number reveals names on the lookup page, so walking through
  // numbers has to be slow.
  lookup: { name: "lookup", limit: 30, windowSec: 60 },
  phoneCheck: { name: "phone-check", limit: 120, windowSec: 60 },
  createRegistration: { name: "register", limit: 20, windowSec: 60 },
  createInvited: { name: "invited", limit: 20, windowSec: 60 },
  addChurch: { name: "church", limit: 20, windowSec: 60 },
  adminLogin: { name: "admin-login", limit: 10, windowSec: 300 },
  queueJoin: { name: "queue-join", limit: 40, windowSec: 60 },
} satisfies Record<string, RateLimitRule>;

export function clientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return forwarded || request.headers.get("x-real-ip") || "local";
}

export type RateLimitResult = { ok: true } | { ok: false; retryAfterSec: number };

export async function rateLimit(request: Request, rule: RateLimitRule): Promise<RateLimitResult> {
  const window = Math.floor(Date.now() / 1000 / rule.windowSec);
  const key = `fp:rl:${rule.name}:${clientIp(request)}:${window}`;

  try {
    const count = await kv.incrWindow(key, rule.windowSec);
    if (count <= rule.limit) return { ok: true };

    const windowEndsAt = (window + 1) * rule.windowSec;
    return { ok: false, retryAfterSec: Math.max(1, windowEndsAt - Math.floor(Date.now() / 1000)) };
  } catch (error) {
    console.error(`[rateLimit] ${rule.name}: limiter unavailable, allowing`, error);
    return { ok: true };
  }
}

export function tooManyRequests(retryAfterSec: number) {
  return NextResponse.json(
    { error: "rate_limited", retryAfterSec },
    { status: 429, headers: { "Retry-After": String(retryAfterSec) } },
  );
}
