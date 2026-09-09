"use client";

import type { AdminAttendeeInput } from "@/lib/admin/attendeeSchema";
import type {
  CheckInAttendee,
  CheckInResponse,
  DoorCounts,
} from "@/lib/admin/checkIn";

// Plain wording for everything the management endpoints can refuse.
export const MANAGE_MESSAGE: Record<string, string> = {
  registration_not_found: "Энэ бүртгэл олдсонгүй. Хуудсаа шинэчилнэ үү.",
  attendee_not_found: "Энэ хүн олдсонгүй. Хуудсаа шинэчилнэ үү.",
  last_attendee:
    "Сүүлчийн хүнийг устгах боломжгүй. Бүртгэлийг бүтнээр нь устгана уу.",
  registration_paid:
    "Төлбөр төлсөн бүртгэлийг устгах боломжгүй. Төлбөрийн бүртгэл хэвээр үлдэнэ.",
  phone_taken: "Энэ дугаар өөр хүнд бүртгэлтэй байна.",
  unauthorized: "Нэвтрэх хугацаа дууссан. Дахин нэвтэрнэ үү.",
  invalid_input: "Мэдээлэл дутуу эсвэл буруу байна.",
  database_error: "Хадгалахад алдаа гарлаа. Дахин оролдоно уу.",
  service_unavailable: "Систем түр сааталтай байна. Хэдхэн минутын дараа оролдоно уу.",
  network_error: "Интернэт холболтоо шалгана уу.",
};

export type AdminResult<T = unknown> =
  | { ok: true; data: T }
  | { ok: false; message: string };

async function send<T>(
  url: string,
  method: string,
  body?: unknown,
): Promise<AdminResult<T>> {
  let res: Response;

  try {
    res = await fetch(url, {
      method,
      headers: body ? { "Content-Type": "application/json" } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    return { ok: false, message: MANAGE_MESSAGE.network_error };
  }

  const data = (await res.json().catch(() => null)) as
    | (T & { error?: string })
    | null;

  if (!res.ok) {
    const code = data?.error ?? "database_error";
    return { ok: false, message: MANAGE_MESSAGE[code] ?? MANAGE_MESSAGE.database_error };
  }

  return { ok: true, data: data as T };
}

export const createAttendee = (registrationId: string, input: AdminAttendeeInput) =>
  send<{ attendeeId: string }>("/api/admin/attendees", "POST", {
    registrationId,
    ...input,
  });

export const saveAttendee = (attendeeId: string, input: AdminAttendeeInput) =>
  send(`/api/admin/attendees/${attendeeId}`, "PATCH", input);

export const removeAttendee = (attendeeId: string) =>
  send(`/api/admin/attendees/${attendeeId}`, "DELETE");

export const cancelRegistration = (registrationId: string) =>
  send(`/api/admin/registrations/${registrationId}`, "PATCH", { action: "cancel" });

export const removeRegistration = (registrationId: string) =>
  send(`/api/admin/registrations/${registrationId}`, "DELETE");

export const previewCleanup = (hours: number) =>
  send<{
    registrations: {
      id: string;
      payerName: string;
      attendeeCount: number;
      status: string;
      createdAt: string;
    }[];
  }>(`/api/admin/cleanup?hours=${hours}`, "GET");

export const runCleanup = (ids: string[]) =>
  send<{ deleted: number }>("/api/admin/cleanup", "POST", { ids });

export const scanTicket = (code: string) =>
  send<CheckInResponse>("/api/admin/check-in", "POST", { code });

export const loadDoorState = () =>
  send<{ counts: DoorCounts; recent: CheckInAttendee[] }>("/api/admin/check-in", "GET");

export const undoCheckIn = (attendeeId: string) =>
  send<{ attendee: CheckInAttendee; counts: DoorCounts }>(
    `/api/admin/check-in?attendeeId=${encodeURIComponent(attendeeId)}`,
    "DELETE",
  );
