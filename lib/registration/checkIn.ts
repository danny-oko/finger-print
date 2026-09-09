import { d1Query, d1QueryOne } from "@/lib/d1";
import {
  parseTicketCode,
  type CheckInAttendee,
  type CheckInResult,
  type DoorCounts,
} from "@/lib/admin/checkIn";
import type { RegistrationStatus } from "@/lib/admin/types";
import type { AttendeeRole } from "@/lib/registration/grade";

type ScanRow = {
  id: string;
  full_name: string;
  grade: number | null;
  role: AttendeeRole;
  church_name: string;
  ticket_code: string;
  checked_in_at: string | null;
  registration_id: string;
  payer_name: string;
  status: RegistrationStatus;
};

function toAttendee(row: ScanRow, checkedInAt: string): CheckInAttendee {
  return {
    attendeeId: row.id,
    fullName: row.full_name,
    grade: row.grade,
    role: row.role,
    churchName: row.church_name,
    ticketCode: row.ticket_code,
    payerName: row.payer_name,
    registrationId: row.registration_id,
    checkedInAt,
  };
}

/**
 * Marks one attendee as arrived, and says which of the five things actually
 * happened so the door staff sees a real answer instead of a spinner.
 *
 * Scanning the same ticket twice never overwrites the first arrival time —
 * a second scan is a fact worth surfacing (a ticket handed back over the
 * fence), not a correction to make silently.
 */
export async function checkInByCode(rawCode: string): Promise<CheckInResult> {
  const code = parseTicketCode(rawCode);
  if (!code) return { outcome: "invalid_code", code: rawCode.trim().slice(0, 40) };

  const row = await d1QueryOne<ScanRow>(
    `SELECT a.id, a.full_name, a.grade, a.role, a.church_name, a.ticket_code,
            a.checked_in_at, a.registration_id, r.payer_name, r.status
       FROM attendees a
       JOIN registrations r ON r.id = a.registration_id
      WHERE a.ticket_code = ?`,
    [code],
  );

  if (!row) return { outcome: "not_found", code };

  // A code is only ever issued against a paid registration, so this is a
  // belt-and-braces check — but "let them in" is the wrong default for the
  // one case where it isn't true.
  if (row.status !== "paid") {
    return { outcome: "unpaid", attendee: toAttendee(row, row.checked_in_at ?? "") };
  }

  if (row.checked_in_at) {
    return { outcome: "already", attendee: toAttendee(row, row.checked_in_at) };
  }

  const now = new Date().toISOString();

  // Guarded so two staff phones scanning the same ticket at the same moment
  // can't both report a first arrival. RETURNING says which write won.
  const claimed = await d1Query<{ id: string }>(
    `UPDATE attendees
        SET checked_in_at = ?
      WHERE id = ? AND checked_in_at IS NULL
      RETURNING id`,
    [now, row.id],
  );

  if (claimed.length > 0) return { outcome: "checked_in", attendee: toAttendee(row, now) };

  const settled = await d1QueryOne<{ checked_in_at: string | null }>(
    "SELECT checked_in_at FROM attendees WHERE id = ?",
    [row.id],
  );

  return { outcome: "already", attendee: toAttendee(row, settled?.checked_in_at ?? now) };
}

/** Undoes a scan — the wrong ticket held up to the camera, caught straight away. */
export async function undoCheckIn(attendeeId: string): Promise<CheckInAttendee | null> {
  const cleared = await d1Query<{ id: string }>(
    `UPDATE attendees
        SET checked_in_at = NULL
      WHERE id = ? AND checked_in_at IS NOT NULL
      RETURNING id`,
    [attendeeId],
  );

  if (cleared.length === 0) return null;

  const row = await d1QueryOne<ScanRow>(
    `SELECT a.id, a.full_name, a.grade, a.role, a.church_name, a.ticket_code,
            a.checked_in_at, a.registration_id, r.payer_name, r.status
       FROM attendees a
       JOIN registrations r ON r.id = a.registration_id
      WHERE a.id = ?`,
    [attendeeId],
  );

  return row ? toAttendee(row, "") : null;
}

/** Heads through the door, over heads expected — the only number a door needs. */
export async function getDoorCounts(): Promise<DoorCounts> {
  const row = await d1QueryOne<{ expected: number; checked_in: number }>(
    `SELECT COUNT(*) AS expected,
            SUM(CASE WHEN a.checked_in_at IS NOT NULL THEN 1 ELSE 0 END) AS checked_in
       FROM attendees a
       JOIN registrations r ON r.id = a.registration_id
      WHERE r.status = 'paid'`,
  );

  return { expected: row?.expected ?? 0, checkedIn: row?.checked_in ?? 0 };
}

const RECENT_LIMIT = 25;

/**
 * The last people through, across every phone on the door — which is what
 * makes "undo" usable by whoever notices the mistake, not only by whoever
 * made it.
 */
export async function getRecentCheckIns(): Promise<CheckInAttendee[]> {
  const rows = await d1Query<ScanRow>(
    `SELECT a.id, a.full_name, a.grade, a.role, a.church_name, a.ticket_code,
            a.checked_in_at, a.registration_id, r.payer_name, r.status
       FROM attendees a
       JOIN registrations r ON r.id = a.registration_id
      WHERE a.checked_in_at IS NOT NULL
      ORDER BY a.checked_in_at DESC
      LIMIT ?`,
    [RECENT_LIMIT],
  );

  return rows.map((row) => toAttendee(row, row.checked_in_at ?? ""));
}
