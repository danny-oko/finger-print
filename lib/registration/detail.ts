import { d1Query, d1QueryOne } from "@/lib/d1";
import type { RegistrationStatus } from "@/lib/admin/types";

// Shared read model for the public registration pages. These URLs are
// guarded only by an unguessable id (a UUID, or a ticket code), so contact
// details are masked before they leave the server: the person who registered
// already knows their own phone and email, and masking means a forwarded or
// shoulder-surfed link doesn't hand out a minor's contact details.

export type DetailAttendee = {
  id: string;
  fullName: string;
  age: number;
  grade: number;
  churchName: string;
  ticketCode: string | null;
  checkedIn: boolean;
};

export type RegistrationDetail = {
  id: string;
  registrantType: "individual" | "church_leader";
  payerName: string;
  payerPhoneMasked: string;
  payerEmailMasked: string | null;
  attendeeCount: number;
  pricePerAttendeeMnt: number;
  totalMnt: number;
  currency: string;
  status: RegistrationStatus;
  awaitingVerification: boolean;
  paidAt: string | null;
  ticketsIssued: boolean;
  createdAt: string;
  attendees: DetailAttendee[];
};

/** 99112233 -> 9911••33 */
export function maskPhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.length < 5) return "••••";
  return `${digits.slice(0, 4)}••${digits.slice(-2)}`;
}

/** danny.otgontsetseg@gmail.com -> d••••••g@gmail.com */
export function maskEmail(email: string | null): string | null {
  if (!email) return null;
  const [local, domain] = email.split("@");
  if (!domain) return "••••";
  if (local.length <= 2) return `${local[0] ?? "•"}••@${domain}`;
  return `${local[0]}${"•".repeat(Math.min(local.length - 2, 6))}${local.at(-1)}@${domain}`;
}

type RegistrationRow = {
  id: string;
  registrant_type: RegistrationDetail["registrantType"];
  payer_name: string;
  payer_phone: string;
  payer_email: string | null;
  attendee_count: number;
  price_per_attendee_mnt: number;
  total_mnt: number;
  currency: string;
  status: RegistrationStatus;
  awaiting_verification_at: string | null;
  paid_at: string | null;
  tickets_issued_at: string | null;
  created_at: string;
};

type AttendeeRow = {
  id: string;
  full_name: string;
  age: number;
  grade: number;
  church_name: string;
  ticket_code: string | null;
  checked_in_at: string | null;
};

export async function getRegistrationDetail(id: string): Promise<RegistrationDetail | null> {
  const registration = await d1QueryOne<RegistrationRow>(
    `SELECT id, registrant_type, payer_name, payer_phone, payer_email, attendee_count,
            price_per_attendee_mnt, total_mnt, currency, status, awaiting_verification_at,
            paid_at, tickets_issued_at, created_at
     FROM registrations WHERE id = ?`,
    [id],
  );

  if (!registration) return null;

  const attendees = await d1Query<AttendeeRow>(
    `SELECT id, full_name, age, grade, church_name, ticket_code, checked_in_at
     FROM attendees WHERE registration_id = ? ORDER BY created_at ASC`,
    [id],
  );

  return {
    id: registration.id,
    registrantType: registration.registrant_type,
    payerName: registration.payer_name,
    payerPhoneMasked: maskPhone(registration.payer_phone),
    payerEmailMasked: maskEmail(registration.payer_email),
    attendeeCount: registration.attendee_count,
    pricePerAttendeeMnt: registration.price_per_attendee_mnt,
    totalMnt: registration.total_mnt,
    currency: registration.currency,
    status: registration.status,
    awaitingVerification: Boolean(registration.awaiting_verification_at),
    paidAt: registration.paid_at,
    ticketsIssued: Boolean(registration.tickets_issued_at),
    createdAt: registration.created_at,
    attendees: attendees.map((a) => ({
      id: a.id,
      fullName: a.full_name,
      age: a.age,
      grade: a.grade,
      churchName: a.church_name,
      ticketCode: a.ticket_code,
      checkedIn: Boolean(a.checked_in_at),
    })),
  };
}

export type TicketDetail = {
  fullName: string;
  age: number;
  grade: number;
  churchName: string;
  ticketCode: string;
  checkedIn: boolean;
  registrationId: string;
  payerName: string;
};

/**
 * Looks up one attendee by their ticket code — the single-ticket view a
 * church leader can forward to each teen individually. A ticket code only
 * exists once a registration is paid, so finding one is itself proof of
 * payment.
 */
export async function getTicketDetail(code: string): Promise<TicketDetail | null> {
  const row = await d1QueryOne<{
    full_name: string;
    age: number;
    grade: number;
    church_name: string;
    ticket_code: string;
    checked_in_at: string | null;
    registration_id: string;
    payer_name: string;
  }>(
    `SELECT a.full_name, a.age, a.grade, a.church_name, a.ticket_code, a.checked_in_at,
            a.registration_id, r.payer_name
     FROM attendees a
     JOIN registrations r ON r.id = a.registration_id
     WHERE a.ticket_code = ? AND r.status = 'paid'`,
    [code],
  );

  if (!row) return null;

  return {
    fullName: row.full_name,
    age: row.age,
    grade: row.grade,
    churchName: row.church_name,
    ticketCode: row.ticket_code,
    checkedIn: Boolean(row.checked_in_at),
    registrationId: row.registration_id,
    payerName: row.payer_name,
  };
}
