import type { RegistrantType } from "@/lib/admin/types";
import type { PaymentMethod } from "@/lib/registration/schema";

export type AnalyticsValue = string | number | boolean | null;

export type AnalyticsEvents = {
  registration_started: Record<string, never>;
  registration_person_added: { attendees: number };
  registration_draft_restored: { attendees: number };

  registration_invalid: { field: string; attendees: number };
  registration_review_opened: { attendees: number };
  registration_submitted: {
    attendees: number;
    registrantType: RegistrantType;
    paymentMethod: PaymentMethod;
  };

  registration_created: {
    attendees: number;
    registrantType: RegistrantType;
    paymentMethod: PaymentMethod;
    totalMnt: number;
  };
  registration_create_failed: { reason: string };
  registration_paid: { totalMnt: number | null };
  registration_awaiting_verification: { totalMnt: number | null };
};

export type AnalyticsEventName = keyof AnalyticsEvents;

export const MAX_LENGTH = 255;

function clamp(value: AnalyticsValue): AnalyticsValue {
  if (typeof value === "string") {
    return value.length > MAX_LENGTH ? value.slice(0, MAX_LENGTH) : value;
  }

  if (typeof value === "number" && !Number.isFinite(value)) return null;
  return value;
}

export function toAnalyticsProperties(
  properties: Record<string, AnalyticsValue | undefined>,
): Record<string, AnalyticsValue> {
  return Object.fromEntries(
    Object.entries(properties)
      .filter(([key, value]) => value !== undefined && key.length <= MAX_LENGTH)
      .map(([key, value]) => [key, clamp(value as AnalyticsValue)]),
  );
}
