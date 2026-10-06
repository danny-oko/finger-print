import { createHmac, timingSafeEqual } from "node:crypto";

// Queue tickets and admission passes are signed rather than stored: the
// registration endpoint can check a pass without a round trip, and a ticket
// carries its own place in line, so someone whose phone slept through a few
// polls goes back to where they were instead of to the back.

export function queueSecret(): string | null {
  const secret = process.env.QUEUE_SECRET ?? process.env.ADMIN_SESSION_SECRET;
  if (secret) return secret;
  return process.env.NODE_ENV === "production" ? null : "dev-only-queue-secret";
}

function sign(payload: string, secret: string): string {
  return createHmac("sha256", secret).update(payload).digest("base64url");
}

export function signToken<T extends object>(data: T): string {
  const secret = queueSecret();
  if (!secret) throw new Error("QUEUE_SECRET is not set");
  const payload = Buffer.from(JSON.stringify(data)).toString("base64url");
  return `${payload}.${sign(payload, secret)}`;
}

export function readToken<T extends object>(token: unknown): T | null {
  const secret = queueSecret();
  if (!secret || typeof token !== "string" || token.length > 1000) return null;

  const [payload, signature] = token.split(".");
  if (!payload || !signature) return null;

  const expected = Buffer.from(sign(payload, secret));
  const received = Buffer.from(signature);
  if (expected.length !== received.length || !timingSafeEqual(expected, received)) return null;

  try {
    return JSON.parse(Buffer.from(payload, "base64url").toString()) as T;
  } catch {
    return null;
  }
}

export type TicketClaims = { k: "ticket"; id: string; n: number; iat: number };

export type PassClaims = { k: "pass"; id: string; exp: number };
