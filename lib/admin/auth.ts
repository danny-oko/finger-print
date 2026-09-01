import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

export const ADMIN_COOKIE = "fp_admin";

const SESSION_TTL_SECONDS = 60 * 60 * 12;

function getSecret(): string {
  const secret = process.env.ADMIN_SESSION_SECRET;

  if (!secret) {
    throw new Error(
      "Missing ADMIN_SESSION_SECRET. See docs/registration-setup.md.",
    );
  }

  return secret;
}

function sign(payload: string): string {
  return createHmac("sha256", getSecret())
    .update(payload, "utf8")
    .digest("hex");
}

/** Constant-time string compare that also tolerates differing lengths. */
function safeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(sign(a), "utf8");
  const bufB = Buffer.from(sign(b), "utf8");
  return timingSafeEqual(bufA, bufB);
}

export function isValidAdminPassword(candidate: string): boolean {
  const expected = process.env.ADMIN_PASSWORD;

  if (!expected) {
    throw new Error("Missing ADMIN_PASSWORD. See docs/registration-setup.md.");
  }

  return safeEqual(candidate, expected);
}

/** Builds a `<expiresAt>.<signature>` session token. */
export function createSessionToken(now = Date.now()): {
  value: string;
  maxAge: number;
} {
  const expiresAt = Math.floor(now / 1000) + SESSION_TTL_SECONDS;
  const payload = String(expiresAt);

  return { value: `${payload}.${sign(payload)}`, maxAge: SESSION_TTL_SECONDS };
}

export function isValidSessionToken(
  token: string | undefined,
  now = Date.now(),
): boolean {
  if (!token) return false;

  const [payload, signature] = token.split(".");
  if (!payload || !signature) return false;

  const expected = Buffer.from(sign(payload), "utf8");
  const received = Buffer.from(signature, "utf8");

  if (expected.length !== received.length) return false;
  if (!timingSafeEqual(expected, received)) return false;

  const expiresAt = Number(payload);
  return Number.isFinite(expiresAt) && expiresAt * 1000 > now;
}

/**
 * The login is opt-in: with no ADMIN_PASSWORD set, the dashboard is open.
 * That makes turning it on later a matter of setting one env var rather than
 * a code change — but it also means an unset variable silently publishes
 * every attendee's name, age and phone number, so callers surface it loudly
 * rather than letting it pass unnoticed.
 */
export function isAdminAuthDisabled(): boolean {
  return !process.env.ADMIN_PASSWORD;
}

export async function isAdminAuthenticated(): Promise<boolean> {
  if (isAdminAuthDisabled()) return true;

  try {
    const store = await cookies();
    return isValidSessionToken(store.get(ADMIN_COOKIE)?.value);
  } catch {
    return false;
  }
}

export const ADMIN_COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
};
