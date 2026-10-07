import { d1Query } from "@/lib/db/d1";

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

/**
 * A registration for one of these people whose transfer staff haven't
 * checked yet. Registering them again would ask the same family to pay twice.
 */
export async function findAwaitingRegistration(phones: string[]): Promise<string | null> {
  const unique = [...new Set(phones.filter(Boolean))];
  if (unique.length === 0) return null;

  const placeholders = unique.map(() => "?").join(", ");
  const rows = await d1Query<{ id: string }>(
    `SELECT r.id
       FROM attendees a
       JOIN registrations r ON r.id = a.registration_id
      WHERE a.phone IN (${placeholders})
        AND r.status = 'pending' AND r.awaiting_verification_at IS NOT NULL
      ORDER BY r.created_at DESC
      LIMIT 1`,
    unique,
  );

  return rows[0]?.id ?? null;
}
