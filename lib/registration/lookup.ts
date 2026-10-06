import type { RegistrantType, RegistrationStatus } from "@/lib/admin/types";
import { d1Query } from "@/lib/db/d1";
import type { AttendeeRole } from "@/lib/registration/grade";

export type LookupAttendee = {
  id: string;
  fullName: string;
  grade: number | null;
  role: AttendeeRole;
  churchName: string;
  checkedIn: boolean;
};

export type LookupRegistration = {
  id: string;
  status: RegistrationStatus;
  invited: boolean;
  registrantType: RegistrantType;
  payerName: string;
  attendeeCount: number;
  totalMnt: number;
  ticketsIssued: boolean;
  awaitingVerification: boolean;
  createdAt: string;
  attendees: LookupAttendee[];
};

type Row = {
  id: string;
  status: RegistrationStatus;
  source: string;
  registrant_type: RegistrantType;
  payer_name: string;
  attendee_count: number;
  total_mnt: number;
  tickets_issued_at: string | null;
  awaiting_verification_at: string | null;
  created_at: string;
  attendee_id: string;
  full_name: string;
  grade: number | null;
  role: AttendeeRole;
  church_name: string;
  checked_in_at: string | null;
};

export async function lookupByPhone(phone: string): Promise<LookupRegistration[]> {
  const rows = await d1Query<Row>(
    `SELECT r.id, r.status, r.source, r.registrant_type, r.payer_name, r.attendee_count,
            r.total_mnt, r.tickets_issued_at, r.awaiting_verification_at, r.created_at,
            a.id AS attendee_id, a.full_name, a.grade, a.role, a.church_name, a.checked_in_at
       FROM registrations r
       JOIN attendees a ON a.registration_id = r.id
      WHERE r.id IN (
              SELECT id FROM registrations WHERE payer_phone = ?
              UNION
              SELECT registration_id FROM attendees WHERE phone = ? OR parent_phone = ?
            )
      ORDER BY r.created_at DESC, a.created_at ASC`,
    [phone, phone, phone],
  );

  const byId = new Map<string, LookupRegistration>();

  for (const row of rows) {
    let registration = byId.get(row.id);
    if (!registration) {
      registration = {
        id: row.id,
        status: row.status,
        invited: row.source === "invite",
        registrantType: row.registrant_type,
        payerName: row.payer_name,
        attendeeCount: row.attendee_count,
        totalMnt: row.total_mnt,
        ticketsIssued: Boolean(row.tickets_issued_at),
        awaitingVerification: Boolean(row.awaiting_verification_at),
        createdAt: row.created_at,
        attendees: [],
      };
      byId.set(row.id, registration);
    }

    registration.attendees.push({
      id: row.attendee_id,
      fullName: row.full_name,
      grade: row.grade,
      role: row.role,
      churchName: row.church_name,
      checkedIn: Boolean(row.checked_in_at),
    });
  }

  return [...byId.values()];
}
