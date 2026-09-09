import { d1Query } from "@/lib/d1";

/**
 * Which of these phones already belong to somebody attending. Only paid
 * registrations count: nothing ever expires a pending one, so blocking on an
 * abandoned checkout would lock a real person out of registering at all.
 * Payer phones don't count either — a leader who paid for ten teens hasn't
 * registered themselves.
 */
export async function findTakenPhones(phones: string[]): Promise<string[]> {
  const unique = [...new Set(phones.filter(Boolean))];
  if (unique.length === 0) return [];

  const placeholders = unique.map(() => "?").join(", ");
  const rows = await d1Query<{ phone: string }>(
    `SELECT DISTINCT a.phone
       FROM attendees a
       JOIN registrations r ON r.id = a.registration_id
      WHERE a.phone IN (${placeholders}) AND r.status = 'paid'`,
    unique,
  );

  return rows.map((r) => r.phone);
}
