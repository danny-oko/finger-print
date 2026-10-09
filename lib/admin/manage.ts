import { v4 as uuid } from "uuid";

import { d1Batch, d1Query, d1QueryOne } from "@/lib/db/d1";
import { toGradeColumns } from "@/lib/registration/grade";
import type { AdminAttendeeInput } from "@/lib/admin/attendeeSchema";
import { issueTickets } from "@/lib/registration/issueTickets";
import { findTakenPhones } from "@/lib/registration/phones";
import { reconcilePendingRegistration } from "@/lib/registration/settle";
import { generateTicketCode } from "@/lib/registration/ticketCode";

// The rules about what may be changed or deleted live here, not in the UI,
// so a stale tab can't talk the server into something.

export type ManageFailure =
  | "phone_taken"
  | "registration_not_found"
  | "attendee_not_found"
  | "last_attendee"
  | "registration_paid"
  | "invite_status_locked";

const MAX_CODE_ATTEMPTS = 5;

async function uniqueTicketCode(): Promise<string> {
  for (let attempt = 0; attempt < MAX_CODE_ATTEMPTS; attempt++) {
    const code = generateTicketCode();
    const clash = await d1QueryOne(
      "SELECT 1 AS hit FROM attendees WHERE ticket_code = ?",
      [code],
    );
    if (!clash) return code;
  }

  throw new Error("Failed to generate a unique ticket code");
}

/**
 * attendee_count is what the dashboard counts heads with, so it follows the
 * rows. The money columns deliberately don't: they record what Byl actually
 * charged, and rewriting them would turn "paid for three, four turned up"
 * into a payment that never happened.
 */
async function syncAttendeeCount(registrationId: string) {
  await d1Query(
    `UPDATE registrations
        SET attendee_count = (SELECT COUNT(*) FROM attendees WHERE registration_id = ?),
            updated_at = ?
      WHERE id = ?`,
    [registrationId, new Date().toISOString(), registrationId],
  );
}

async function rememberChurch(name: string) {
  await d1Query(
    "INSERT OR IGNORE INTO churches (id, name, created_at) VALUES (?, ?, ?)",
    [uuid(), name, new Date().toISOString()],
  );
}

export async function addAttendee(
  registrationId: string,
  input: AdminAttendeeInput,
): Promise<{ ok: true; attendeeId: string } | { ok: false; reason: ManageFailure }> {
  const registration = await d1QueryOne<{ id: string; status: string }>(
    "SELECT id, status FROM registrations WHERE id = ?",
    [registrationId],
  );

  if (!registration) return { ok: false, reason: "registration_not_found" };

  const { grade, role } = toGradeColumns(input.grade);
  const attendeeId = uuid();

  // The rest of this registration already has tickets, so someone added now
  // needs one too — otherwise they arrive with nothing to scan.
  const ticketCode =
    registration.status === "paid" ? await uniqueTicketCode() : null;

  await d1Query(
    `INSERT INTO attendees (
       id, registration_id, full_name, phone, church_name, grade, role, ticket_code, created_at
     ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      attendeeId,
      registrationId,
      input.fullName,
      input.phone ?? null,
      input.churchName,
      grade,
      role,
      ticketCode,
      new Date().toISOString(),
    ],
  );

  await rememberChurch(input.churchName);
  await syncAttendeeCount(registrationId);

  return { ok: true, attendeeId };
}

export async function updateAttendee(
  attendeeId: string,
  input: AdminAttendeeInput,
): Promise<{ ok: true } | { ok: false; reason: ManageFailure }> {
  const attendee = await d1QueryOne<{ id: string }>(
    "SELECT id FROM attendees WHERE id = ?",
    [attendeeId],
  );

  if (!attendee) return { ok: false, reason: "attendee_not_found" };

  // The same rule as adding someone: one number, one attendee.
  if (input.phone && (await findTakenPhones([input.phone], attendeeId)).length > 0) {
    return { ok: false, reason: "phone_taken" };
  }

  const { grade, role } = toGradeColumns(input.grade);

  await d1Query(
    `UPDATE attendees
        SET full_name = ?, phone = ?, church_name = ?, grade = ?, role = ?
      WHERE id = ?`,
    [
      input.fullName,
      input.phone ?? null,
      input.churchName,
      grade,
      role,
      attendeeId,
    ],
  );

  await rememberChurch(input.churchName);

  return { ok: true };
}

export async function deleteAttendee(
  attendeeId: string,
): Promise<{ ok: true } | { ok: false; reason: ManageFailure }> {
  const attendee = await d1QueryOne<{ registration_id: string }>(
    "SELECT registration_id FROM attendees WHERE id = ?",
    [attendeeId],
  );

  if (!attendee) return { ok: false, reason: "attendee_not_found" };

  const siblings = await d1QueryOne<{ count: number }>(
    "SELECT COUNT(*) AS count FROM attendees WHERE registration_id = ?",
    [attendee.registration_id],
  );

  // A registration with nobody on it is a payment for nothing — the way to
  // get rid of the whole thing is to delete the registration.
  if ((siblings?.count ?? 0) <= 1) return { ok: false, reason: "last_attendee" };

  await d1Query("DELETE FROM attendees WHERE id = ?", [attendeeId]);
  await syncAttendeeCount(attendee.registration_id);

  return { ok: true };
}

export async function cancelRegistration(
  registrationId: string,
): Promise<{ ok: true } | { ok: false; reason: ManageFailure }> {
  const registration = await d1QueryOne<{ status: string }>(
    "SELECT status FROM registrations WHERE id = ?",
    [registrationId],
  );

  if (!registration) return { ok: false, reason: "registration_not_found" };
  if (registration.status === "paid") return { ok: false, reason: "registration_paid" };

  await d1Query(
    "UPDATE registrations SET status = 'cancelled', updated_at = ? WHERE id = ?",
    [new Date().toISOString(), registrationId],
  );

  return { ok: true };
}

export const MANUAL_STATUSES = ["paid", "pending", "cancelled"] as const;
export type ManualStatus = (typeof MANUAL_STATUSES)[number];

/**
 * For payments Byl never reported, cash at the door, or a mistake to undo.
 * Leaving 'paid' keeps the ticket codes — check-in refuses them while the
 * registration is unpaid — but clears tickets_issued_at so anyone added in
 * the meantime gets a code when it's marked paid again.
 */
export async function setRegistrationStatus(
  registrationId: string,
  status: ManualStatus,
): Promise<{ ok: true } | { ok: false; reason: ManageFailure }> {
  const registration = await d1QueryOne<{ status: string; source: string }>(
    "SELECT status, source FROM registrations WHERE id = ?",
    [registrationId],
  );

  if (!registration) return { ok: false, reason: "registration_not_found" };
  // An invite never had a payment, so the only status change that makes
  // sense is revoking it.
  if (registration.source === "invite" && status !== "cancelled") {
    return { ok: false, reason: "invite_status_locked" };
  }
  // Not for "paid": if a prior call's issueTickets() threw after the status
  // write already committed, the registration reads back as paid with no
  // tickets issued, and this must retry rather than look like a no-op.
  if (status !== "paid" && registration.status === status) return { ok: true };

  const now = new Date().toISOString();

  if (status === "paid") {
    await d1Query(
      `UPDATE registrations
          SET status = 'paid', paid_at = COALESCE(paid_at, ?),
              awaiting_verification_at = NULL, updated_at = ?
        WHERE id = ?`,
      [now, now, registrationId],
    );
    await issueTickets(registrationId);
    return { ok: true };
  }

  await d1Query(
    `UPDATE registrations
        SET status = ?, paid_at = NULL, tickets_issued_at = NULL, updated_at = ?
      WHERE id = ?`,
    [status, now, registrationId],
  );

  return { ok: true };
}

/**
 * Removes the registration and everything hanging off it. Paid ones are
 * refused outright: a paid row is the only record that money changed hands,
 * and no dashboard button should be able to erase that.
 */
export async function deleteRegistration(
  registrationId: string,
): Promise<{ ok: true } | { ok: false; reason: ManageFailure }> {
  const registration = await d1QueryOne<{
    status: string;
    source: string;
    byl_checkout_id: string | null;
    awaiting_verification_at: string | null;
  }>(
    "SELECT status, source, byl_checkout_id, awaiting_verification_at FROM registrations WHERE id = ?",
    [registrationId],
  );

  if (!registration) return { ok: false, reason: "registration_not_found" };
  // An invite is 'paid' only so its ticket works — there's no money to protect.
  if (registration.status === "paid" && registration.source !== "invite") {
    return { ok: false, reason: "registration_paid" };
  }

  // A pending checkout may have been paid without the webhook ever landing.
  // Ask Byl first, so deleting can't erase someone's payment.
  if (
    await reconcilePendingRegistration(registrationId, { id: registrationId, ...registration })
  ) {
    return { ok: false, reason: "registration_paid" };
  }

  // One transaction, children first (D1 enforces foreign keys), and each
  // statement re-checks the rule so a payment landing in between is kept.
  const deletable = `SELECT id FROM registrations
                      WHERE id = ? AND (status != 'paid' OR source = 'invite')`;
  const [, , removed] = await d1Batch([
    { sql: `DELETE FROM payment_events WHERE registration_id IN (${deletable})`, params: [registrationId] },
    { sql: `DELETE FROM attendees WHERE registration_id IN (${deletable})`, params: [registrationId] },
    { sql: `DELETE FROM registrations WHERE id IN (${deletable})`, params: [registrationId] },
  ]);

  return removed.changes > 0 ? { ok: true } : { ok: false, reason: "registration_paid" };
}

export type StaleRegistration = {
  id: string;
  payerName: string;
  attendeeCount: number;
  status: string;
  createdAt: string;
};

/**
 * Checkouts and invoices that were opened and then abandoned. They're never
 * cleaned up on their own — nothing expires a pending registration — so they
 * pile up in the dashboard looking like people who are about to pay. A
 * transfer awaiting verification isn't abandoned: someone says they paid.
 */
export async function findStaleUnpaid(olderThanHours: number): Promise<StaleRegistration[]> {
  const cutoff = new Date(Date.now() - olderThanHours * 3600_000).toISOString();

  const rows = await d1Query<{
    id: string;
    payer_name: string;
    attendee_count: number;
    status: string;
    created_at: string;
  }>(
    `SELECT id, payer_name, attendee_count, status, created_at
       FROM registrations
      WHERE (status IN ('failed', 'expired', 'cancelled')
             OR (status = 'pending' AND awaiting_verification_at IS NULL
                 AND (expires_at IS NULL OR expires_at < ?)))
        AND created_at < ?
      ORDER BY created_at ASC`,
    [new Date().toISOString(), cutoff],
  );

  return rows.map((row) => ({
    id: row.id,
    payerName: row.payer_name,
    attendeeCount: row.attendee_count,
    status: row.status,
    createdAt: row.created_at,
  }));
}

export async function deleteRegistrations(ids: string[]): Promise<number> {
  let deleted = 0;

  for (const id of ids) {
    // One that can't be checked with Byl right now is skipped, not fatal.
    const result = await deleteRegistration(id).catch((error) => {
      console.error("Skipped deleting registration", id, error);
      return null;
    });
    if (result?.ok) deleted++;
  }

  return deleted;
}
