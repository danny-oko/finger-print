import { waitUntil } from "@vercel/functions";

import { trackServerEvent } from "@/lib/analytics/server";
import { parseBylAmount, retrieveCheckout } from "@/lib/byl";
import { d1Query, d1QueryOne } from "@/lib/db/d1";
import { kv } from "@/lib/kv";
import { issueTickets } from "@/lib/registration/issueTickets";

type PendingRow = {
  id: string;
  status: string;
  byl_checkout_id: string | null;
  awaiting_verification_at: string | null;
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
export async function reconcilePendingRegistration(
  id: string,
  known?: PendingRow,
): Promise<boolean> {
  const row =
    known ??
    (await d1QueryOne<PendingRow>(
      `SELECT id, status, byl_checkout_id, awaiting_verification_at FROM registrations WHERE id = ?`,
      [id],
    ));

  if (!row || row.status !== "pending" || !row.byl_checkout_id) return false;

  const checkout = await retrieveCheckout(row.byl_checkout_id);
  const now = new Date().toISOString();

  // A claimed-but-unconfirmed bank transfer. Still pending until a merchant
  // verifies it, but the admin monitor should see it's waiting on a human.
  if (checkout.status === "pending") {
    if (row.awaiting_verification_at) return false;
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

const RECONCILE_EVERY_SEC = 15;

/**
 * The registration page polls while a payment is pending, and every poll
 * asking Byl would multiply into a lot of Byl and D1 traffic during a rush.
 * One check per registration per interval, across every instance, is plenty.
 */
export async function reconcileThrottled(id: string): Promise<boolean> {
  const fresh = await kv
    .setNx(`fp:reconcile:${id}`, "1", RECONCILE_EVERY_SEC)
    .catch(() => true);
  return fresh ? reconcilePendingRegistration(id) : false;
}

const RECONCILE_CONCURRENCY = 6;
const SWEEP_EVERY_SEC = 120;
const SWEEP_LIMIT = 30;
const SWEEP_MIN_AGE_MS = 60_000;

/**
 * The per-registration reconcile only fires while the registrant keeps their
 * page open, so anyone who paid and closed the tab stays pending unless the
 * admin monitor sweeps them too.
 *
 * Every open dashboard refreshes each minute, and a sweep costs a D1 read
 * and a Byl call per pending registration — so it runs at most once per
 * SWEEP_EVERY_SEC across all instances, over the most recent pending ones
 * the webhook has had time to settle. Returns how many it settled.
 */
export async function reconcileAllPending(): Promise<number> {
  const due = await kv.setNx("fp:reconcile:sweep", "1", SWEEP_EVERY_SEC).catch(() => true);
  if (!due) return 0;

  const rows = await d1Query<PendingRow>(
    `SELECT id, status, byl_checkout_id, awaiting_verification_at FROM registrations
      WHERE status = 'pending' AND byl_checkout_id IS NOT NULL AND created_at < ?
      ORDER BY created_at DESC
      LIMIT ?`,
    [new Date(Date.now() - SWEEP_MIN_AGE_MS).toISOString(), SWEEP_LIMIT],
  );

  let settled = 0;
  for (let i = 0; i < rows.length; i += RECONCILE_CONCURRENCY) {
    const results = await Promise.allSettled(
      rows
        .slice(i, i + RECONCILE_CONCURRENCY)
        .map((row) => reconcilePendingRegistration(row.id, row)),
    );
    for (const [j, result] of results.entries()) {
      if (result.status === "fulfilled") {
        if (result.value) settled++;
      } else {
        console.error("Failed to reconcile registration", rows[i + j].id, result.reason);
      }
    }
  }

  return settled;
}
