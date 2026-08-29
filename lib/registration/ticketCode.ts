import { randomBytes } from "node:crypto";

// Excludes 0/O, 1/I/L so a staff member can retype a code by hand if a
// scanner ever fails to read it.
const ALPHABET = "23456789ABCDEFGHJKMNPQRSTUVWXYZ";

/**
 * Generates a ticket code, e.g. "FP-7K2Q-X9M4". This is the literal payload
 * encoded into the attendee's QR code — the future admin scanner just needs
 * to look up `attendees.ticket_code` by this string.
 */
export function generateTicketCode(): string {
  const bytes = randomBytes(8);
  let code = "";
  for (const byte of bytes) {
    code += ALPHABET[byte % ALPHABET.length];
  }
  return `FP-${code.slice(0, 4)}-${code.slice(4, 8)}`;
}
