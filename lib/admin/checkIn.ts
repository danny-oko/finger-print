import type { AttendeeRole } from "@/lib/registration/grade";

// Shared by the door scanner and the endpoint behind it. Nothing here
// touches the database, so the phone can format an outcome without waiting
// on another round trip.

export const TICKET_CODE_PATTERN = /^FP-[A-Z0-9]{4}-[A-Z0-9]{4}$/;

export type CheckInAttendee = {
  attendeeId: string;
  fullName: string;
  grade: number | null;
  role: AttendeeRole;
  churchName: string;
  ticketCode: string;
  payerName: string;
  registrationId: string;
  checkedInAt: string;
};

export type CheckInOutcome =
  | "checked_in"
  | "already"
  | "unpaid"
  | "not_found"
  | "invalid_code";

export type CheckInResult =
  | { outcome: "checked_in" | "already" | "unpaid"; attendee: CheckInAttendee }
  | { outcome: "not_found"; code: string }
  | { outcome: "invalid_code"; code: string };

export type DoorCounts = { expected: number; checkedIn: number };

export type CheckInResponse = { result: CheckInResult; counts: DoorCounts };

/**
 * Accepts what a camera or a tired thumb actually produces: the bare code,
 * the same code lowercased or without its dashes, or a /event/ticket/<code>
 * URL if a QR is ever changed to encode one.
 */
export function parseTicketCode(raw: string): string | null {
  const tail = raw.trim().split(/[?#]/)[0].split("/").filter(Boolean).pop() ?? "";
  const compact = tail.toUpperCase().replace(/[^A-Z0-9]/g, "");
  const body = compact.length === 10 && compact.startsWith("FP") ? compact.slice(2) : compact;

  if (body.length !== 8) return null;

  const code = `FP-${body.slice(0, 4)}-${body.slice(4)}`;
  return TICKET_CODE_PATTERN.test(code) ? code : null;
}

export type OutcomeTone = "success" | "warning" | "danger";

export const OUTCOME_TONE: Record<CheckInOutcome, OutcomeTone> = {
  checked_in: "success",
  already: "warning",
  unpaid: "danger",
  not_found: "danger",
  invalid_code: "danger",
};

export const OUTCOME_TITLE: Record<CheckInOutcome, string> = {
  checked_in: "Ирсэн бүртгэл хийгдлээ",
  already: "Өмнө нь бүртгэгдсэн",
  unpaid: "Төлбөр төлөгдөөгүй",
  not_found: "Тасалбар олдсонгүй",
  invalid_code: "QR танигдсангүй",
};

export const OUTCOME_HINT: Record<CheckInOutcome, string> = {
  checked_in: "Оруулж болно.",
  already: "Энэ тасалбараар нэгэнт орсон байна. Хэн болохыг нь шалгана уу.",
  unpaid: "Төлбөр бүрэн ороогүй байна. Бүртгэлийн ширээ рүү явуулна уу.",
  not_found: "Энэ код бүртгэлд алга. Нэрээр нь хайж шалгаарай.",
  invalid_code: "Дахин уншуулна уу, эсвэл кодыг гараар оруулна уу.",
};

/** 24-hour, because that is how a door reads a clock here. */
export function formatCheckInTime(iso: string): string {
  const date = new Date(iso);
  return Number.isNaN(date.getTime())
    ? "—"
    : date.toLocaleTimeString("mn-MN", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });
}
