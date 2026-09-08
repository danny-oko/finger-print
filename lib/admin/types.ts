import type { AttendeeRole } from "@/lib/registration/grade";

export type RegistrationStatus =
  | "pending"
  | "paid"
  | "failed"
  | "expired"
  | "cancelled";

export type RegistrantType = "individual" | "church_leader";

export type { AttendeeRole };

/**
 * One attendee, flattened together with the registration that paid for
 * them. This is the monitor's single source row: a teen who signed up alone
 * and a teen entered by their church leader (ahlagch) produce the exact same
 * shape, differing only in `registrantType` — so every view can group,
 * filter and sort across both paths without special-casing either.
 */
export type MonitorRow = {
  attendeeId: string;
  fullName: string;
  phone: string | null;
  parentPhone: string | null;
  churchName: string;
  grade: number | null;
  role: AttendeeRole;
  ticketCode: string | null;
  checkedInAt: string | null;
  attendeeCreatedAt: string;

  registrationId: string;
  registrantType: RegistrantType;
  payerName: string;
  payerPhone: string;
  payerEmail: string | null;
  attendeeCount: number;
  pricePerAttendeeMnt: number;
  totalMnt: number;
  currency: string;
  status: RegistrationStatus;
  paidAt: string | null;
  awaitingVerificationAt: string | null;
  ticketsIssuedAt: string | null;
  bylCheckoutId: string | null;
  bylCheckoutUrl: string | null;
  registrationCreatedAt: string;
};

export type MonitorResponse = {
  rows: MonitorRow[];
  generatedAt: string;
  truncated: boolean;
};
