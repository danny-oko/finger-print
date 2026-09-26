import { createHash, timingSafeEqual } from "node:crypto";

export type RegistrationSource = "public" | "invite";

// The invite link is the only thing standing between a stranger and a free
// ticket, and this repo is public — so the token lives in the environment,
// never in source. Unset or too short means the invite page is simply off.
const MIN_TOKEN_LENGTH = 12;

function digest(value: string): Buffer {
  return createHash("sha256").update(value).digest();
}

export function isValidInviteToken(candidate: unknown): boolean {
  const expected = process.env.INVITE_TOKEN?.trim();
  if (!expected || expected.length < MIN_TOKEN_LENGTH) return false;
  if (typeof candidate !== "string" || candidate.length === 0) return false;

  // Hashing first gives timingSafeEqual equal-length inputs.
  return timingSafeEqual(digest(candidate), digest(expected));
}
