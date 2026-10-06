import {
  parseTicketCode,
  type CheckInAttendee,
  type CheckInResult,
  type DoorCounts,
  type DoorSearchHit,
} from "@/lib/admin/checkIn";
import type { RegistrationStatus } from "@/lib/admin/types";
import { cached } from "@/lib/cache";
import { d1Batch, type D1Statement } from "@/lib/db/d1";
import type { AttendeeRole } from "@/lib/registration/grade";

// Every door action is one D1 request: the write, the row it touched and the
// fresh door counts go out together as a batch. Several phones scanning a
// queue of hundreds is the busiest the database gets on the day, and this
// keeps it to one call per person through the door.

type ScanRow = {
  id: string;
  full_name: string;
  grade: number | null;
  role: AttendeeRole;
  church_name: string;
  ticket_code: string | null;
  phone: string | null;
  checked_in_at: string | null;
  registration_id: string;
  payer_name: string;
  status: RegistrationStatus;
};

const SCAN_COLUMNS = `a.id, a.full_name, a.grade, a.role, a.church_name, a.ticket_code, a.phone,
  a.checked_in_at, a.registration_id, r.payer_name, r.status`;

const COUNTS: D1Statement = {
  sql: `SELECT COUNT(*) AS expected,
               COALESCE(SUM(CASE WHEN a.checked_in_at IS NOT NULL THEN 1 ELSE 0 END), 0) AS checked_in
          FROM attendees a
          JOIN registrations r ON r.id = a.registration_id
         WHERE r.status = 'paid'`,
};

function toAttendee(row: ScanRow, checkedInAt = row.checked_in_at ?? ""): CheckInAttendee {
  return {
    attendeeId: row.id,
    fullName: row.full_name,
    grade: row.grade,
    role: row.role,
    churchName: row.church_name,
    ticketCode: row.ticket_code ?? "",
    payerName: row.payer_name,
    registrationId: row.registration_id,
    checkedInAt,
  };
}

function toCounts(rows: unknown[]): DoorCounts {
  const row = rows[0] as { expected?: number; checked_in?: number } | undefined;
  return { expected: row?.expected ?? 0, checkedIn: row?.checked_in ?? 0 };
}

async function checkIn(
  where: "a.ticket_code = ?" | "a.id = ?",
  value: string,
): Promise<{ result: CheckInResult | null; counts: DoorCounts }> {
  const now = new Date().toISOString();
  const column = where === "a.id = ?" ? "id" : "ticket_code";

  const [claimed, found, counts] = await d1Batch([
    {
      sql: `UPDATE attendees SET checked_in_at = ?
             WHERE ${column} = ? AND checked_in_at IS NULL
               AND registration_id IN (SELECT id FROM registrations WHERE status = 'paid')
            RETURNING id`,
      params: [now, value],
    },
    {
      sql: `SELECT ${SCAN_COLUMNS} FROM attendees a
              JOIN registrations r ON r.id = a.registration_id
             WHERE ${where}`,
      params: [value],
    },
    COUNTS,
  ]);

  const row = found.rows[0] as ScanRow | undefined;
  const doorCounts = toCounts(counts.rows);
  if (!row) return { result: null, counts: doorCounts };

  roster.invalidate();

  if (claimed.rows.length > 0) {
    return { result: { outcome: "checked_in", attendee: toAttendee(row, now) }, counts: doorCounts };
  }

  // A code is only ever issued against a paid registration, so this is a
  // belt-and-braces check — but "let them in" is the wrong default for the
  // one case where it isn't true.
  if (row.status !== "paid") {
    return { result: { outcome: "unpaid", attendee: toAttendee(row) }, counts: doorCounts };
  }

  return { result: { outcome: "already", attendee: toAttendee(row) }, counts: doorCounts };
}

export async function checkInByCode(
  rawCode: string,
): Promise<{ result: CheckInResult; counts: DoorCounts | null }> {
  const code = parseTicketCode(rawCode);
  if (!code) {
    return { result: { outcome: "invalid_code", code: rawCode.trim().slice(0, 40) }, counts: null };
  }

  const { result, counts } = await checkIn("a.ticket_code = ?", code);
  return { result: result ?? { outcome: "not_found", code }, counts };
}

export async function checkInById(
  attendeeId: string,
): Promise<{ result: CheckInResult | null; counts: DoorCounts }> {
  return checkIn("a.id = ?", attendeeId);
}

export async function undoCheckIn(
  attendeeId: string,
): Promise<{ attendee: CheckInAttendee; counts: DoorCounts } | null> {
  const [cleared, found, counts] = await d1Batch([
    {
      sql: `UPDATE attendees SET checked_in_at = NULL
             WHERE id = ? AND checked_in_at IS NOT NULL
            RETURNING id`,
      params: [attendeeId],
    },
    {
      sql: `SELECT ${SCAN_COLUMNS} FROM attendees a
              JOIN registrations r ON r.id = a.registration_id
             WHERE a.id = ?`,
      params: [attendeeId],
    },
    COUNTS,
  ]);

  const row = found.rows[0] as ScanRow | undefined;
  if (cleared.rows.length === 0 || !row) return null;

  roster.invalidate();
  return { attendee: toAttendee(row, ""), counts: toCounts(counts.rows) };
}

const RECENT_LIMIT = 25;

export async function getDoorState(): Promise<{ counts: DoorCounts; recent: CheckInAttendee[] }> {
  const [counts, recent] = await d1Batch([
    COUNTS,
    {
      sql: `SELECT ${SCAN_COLUMNS} FROM attendees a
              JOIN registrations r ON r.id = a.registration_id
             WHERE a.checked_in_at IS NOT NULL
             ORDER BY a.checked_in_at DESC
             LIMIT ?`,
      params: [RECENT_LIMIT],
    },
  ]);

  return {
    counts: toCounts(counts.rows),
    recent: (recent.rows as ScanRow[]).map((row) => toAttendee(row)),
  };
}

// Search reads one cached roster per instance instead of a LIKE query per
// keystroke: it answers instantly, and SQLite's LIKE only folds case for
// ASCII, which would make "бат" miss "Бат".
const roster = cached(15_000, async () => {
  const [rows] = await d1Batch<ScanRow>([
    {
      sql: `SELECT ${SCAN_COLUMNS}, r.payer_phone AS payer_phone FROM attendees a
              JOIN registrations r ON r.id = a.registration_id
             WHERE r.status IN ('paid', 'pending')`,
    },
  ]);
  return rows.rows as (ScanRow & { payer_phone: string })[];
});

const SEARCH_LIMIT = 20;

function fold(value: string): string {
  return value.toLocaleLowerCase("mn").replace(/\s+/g, " ").trim();
}

export async function searchAttendees(query: string): Promise<DoorSearchHit[]> {
  const q = fold(query);
  if (q.length < 2) return [];

  const digits = q.replace(/\D/g, "");
  const code = parseTicketCode(query);

  const hits = (await roster()).filter((row) => {
    if (code && row.ticket_code === code) return true;
    if (digits.length >= 4 && (row.phone?.includes(digits) || row.payer_phone?.includes(digits))) {
      return true;
    }
    return fold(row.full_name).includes(q);
  });

  return hits
    .sort(
      (a, b) =>
        Number(b.status === "paid") - Number(a.status === "paid") ||
        a.full_name.localeCompare(b.full_name, "mn"),
    )
    .slice(0, SEARCH_LIMIT)
    .map((row) => ({
      ...toAttendee(row),
      checkedInAt: row.checked_in_at,
      paid: row.status === "paid",
      phoneTail: row.phone ? row.phone.slice(-4) : null,
    }));
}
