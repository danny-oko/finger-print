"use client";

import type { AdminAttendeeInput } from "@/lib/admin/attendeeSchema";
import type {
  CheckInAttendee,
  CheckInResponse,
  DoorCounts,
  DoorSearchHit,
} from "@/lib/admin/checkIn";
import type { ManualStatus } from "@/lib/admin/manage";
import type { DrawResponse, LotteryState } from "@/lib/lottery/types";
import type { AdminSettingsResponse } from "@/app/api/admin/settings/route";
import type { SettingsPatch } from "@/lib/registration/settings";

// Plain wording for everything the management endpoints can refuse.
export const MANAGE_MESSAGE: Record<string, string> = {
  registration_not_found: "Энэ бүртгэл олдсонгүй. Хуудсаа шинэчилнэ үү.",
  attendee_not_found: "Энэ хүн олдсонгүй. Хуудсаа шинэчилнэ үү.",
  last_attendee:
    "Сүүлчийн хүнийг устгах боломжгүй. Бүртгэлийг бүтнээр нь устгана уу.",
  registration_paid:
    "Төлбөр төлсөн бүртгэлийг устгах боломжгүй. Төлбөрийн бүртгэл хэвээр үлдэнэ.",
  invite_status_locked:
    "Урилгаар бүртгүүлсэн хүний төлбөрийн төлөвийг өөрчлөх боломжгүй. Хэрэггүй бол бүртгэлийг устгана уу.",
  phone_taken: "Энэ дугаар өөр хүнд бүртгэлтэй байна.",
  lottery_pool_empty:
    "Сугалаанд оролцох хүн үлдсэнгүй. Хаалган дээр ирсэн бүртгэл хийгдсэн хүн л оролцоно — өсвөрийн ахлагч, Магтаалын баг оролцохгүй.",
  winner_not_found: "Энэ азтан олдсонгүй. Хуудсаа шинэчилнэ үү.",
  unauthorized: "Нэвтрэх хугацаа дууссан. Дахин нэвтэрнэ үү.",
  invalid_input: "Мэдээлэл дутуу эсвэл буруу байна.",
  database_error: "Хадгалахад алдаа гарлаа. Дахин оролдоно уу.",
  service_unavailable: "Систем түр сааталтай байна. Хэдхэн минутын дараа оролдоно уу.",
  network_error: "Интернэт холболтоо шалгана уу.",
  rate_limited: "Хэт олон удаа оролдлоо. Түр хүлээнэ үү.",
};

export type AdminResult<T = unknown> =
  | { ok: true; data: T }
  | { ok: false; message: string; offline?: boolean };

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
    return { ok: false, message: MANAGE_MESSAGE.network_error, offline: true };
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

export const setPaymentStatus = (registrationId: string, status: ManualStatus) =>
  send(`/api/admin/registrations/${registrationId}`, "PATCH", { action: "set_status", status });

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

export const checkInAttendee = (attendeeId: string) =>
  send<CheckInResponse>("/api/admin/check-in", "POST", { attendeeId });

export const searchDoor = (query: string) =>
  send<{ hits: DoorSearchHit[] }>(`/api/admin/check-in?q=${encodeURIComponent(query)}`, "GET");

export const loadDoorState = () =>
  send<{ counts: DoorCounts; recent: CheckInAttendee[] }>("/api/admin/check-in", "GET");

export const undoCheckIn = (attendeeId: string) =>
  send<{ attendee: CheckInAttendee; counts: DoorCounts }>(
    `/api/admin/check-in?attendeeId=${encodeURIComponent(attendeeId)}`,
    "DELETE",
  );

export const loadRegistrationSettings = () =>
  send<AdminSettingsResponse>("/api/admin/settings", "GET");

export const saveRegistrationSettings = (patch: SettingsPatch) =>
  send<AdminSettingsResponse>("/api/admin/settings", "PATCH", patch);

export const loadLottery = () => send<LotteryState>("/api/admin/lottery", "GET");

export const drawLottery = () => send<DrawResponse>("/api/admin/lottery", "POST", {});

export const removeLotteryWinner = (winnerId: string) =>
  send<LotteryState>(`/api/admin/lottery?id=${encodeURIComponent(winnerId)}`, "DELETE");
