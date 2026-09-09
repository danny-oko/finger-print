import { waitUntil } from "@vercel/functions";

import { trackServerEvent } from "@/lib/analytics/server";
import { parseBylAmount, retrieveCheckout } from "@/lib/byl";
import { d1Query, d1QueryOne } from "@/lib/d1";
import { issueTickets } from "@/lib/registration/issueTickets";

type PendingRow = {
  id: string;
  status: string;
  byl_checkout_id: string | null;
};

/**
 * The webhook is the fast path to 'paid'. This is the fallback for when it
 * never lands — a wrong signing secret, an endpoint Byl disabled after too
 * many failures, a deploy that was down. Without it a completed payment sits
 * 'pending' forever and nobody finds out until the registrant complains.
 *
 * Returns true only when this call is what settled the registration, so the
 * caller knows to re-read.
 */
export async function reconcilePendingRegistration(id: string): Promise<boolean> {
  const row = await d1QueryOne<PendingRow>(
    `SELECT id, status, byl_checkout_id FROM registrations WHERE id = ?`,
    [id],
  );

  if (!row || row.status !== "pending" || !row.byl_checkout_id) return false;

  const checkout = await retrieveCheckout(row.byl_checkout_id);
  const now = new Date().toISOString();

  // A claimed-but-unconfirmed bank transfer. Still pending until a merchant
  // verifies it, but the admin monitor should see it's waiting on a human.
  if (checkout.status === "pending") {
    await d1Query(
      `UPDATE registrations
       SET awaiting_verification_at = COALESCE(awaiting_verification_at, ?), updated_at = ?
       WHERE id = ? AND status = 'pending'`,
      [now, now, id],
    );
    return false;
  }

  if (checkout.status !== "complete") return false;

  await d1Query(
    `UPDATE registrations
     SET status = 'paid',
         paid_at = COALESCE(paid_at, ?),
         awaiting_verification_at = NULL,
         updated_at = ?
     WHERE id = ? AND status = 'pending'`,
    [now, now, id],
  );

  waitUntil(
    trackServerEvent("registration_paid", {
      totalMnt: parseBylAmount(checkout.amount_total),
    }),
  );

  await issueTickets(id);

  return true;
}
