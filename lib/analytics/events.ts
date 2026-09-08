import type { RegistrantType } from "@/lib/admin/types";

/**
 * Vercel Web Analytics accepts only these as custom property values —
 * nested objects are rejected outright.
 */
export type AnalyticsValue = string | number | boolean | null;

/**
 * Every custom event this app sends, with the shape of its properties.
 *
 * Declaring them in one place is not ceremony: custom event names are
 * plan-limited and a typo silently creates a second, near-identical event in
 * the dashboard. It also keeps the funnel auditable at a glance — and this
 * app handles minors' names and phone numbers, none of which may ever leave
 * for a third party, so it should be obvious from one file that nothing here
 * carries personal data.
 */
export type AnalyticsEvents = {
  /** First keystroke in the registration form — page views alone can't tell
   *  a bounce from someone who started typing and gave up. */
  registration_started: Record<string, never>;
  registration_person_added: { attendees: number };
  registration_draft_restored: { attendees: number };
  /** Which field blocked a submit. The path (e.g. "attendees.0.phone") is a
   *  field name, never its value. */
  registration_invalid: { field: string; attendees: number };
  registration_submitted: { attendees: number; registrantType: RegistrantType };
  /** Server-side: the row and the Byl checkout both exist. */
  registration_created: {
    attendees: number;
    registrantType: RegistrantType;
    totalMnt: number;
  };
  registration_create_failed: { reason: string };
  registration_paid: { totalMnt: number | null };
  registration_awaiting_verification: { totalMnt: number | null };
};

export type AnalyticsEventName = keyof AnalyticsEvents;

/** Vercel rejects event names, property keys and values over this length. */
export const MAX_LENGTH = 255;

function clamp(value: AnalyticsValue): AnalyticsValue {
  if (typeof value === "string") {
    return value.length > MAX_LENGTH ? value.slice(0, MAX_LENGTH) : value;
  }
  // NaN and Infinity aren't valid JSON numbers and would fail the whole
  // event, so they degrade to null rather than taking the event with them.
  if (typeof value === "number" && !Number.isFinite(value)) return null;
  return value;
}

/**
 * Brings properties inside Vercel's limits. Anything that would make the
 * whole event fail is dropped or truncated, on the principle that a partial
 * event beats a lost one — analytics is never worth failing a request over.
 */
export function toAnalyticsProperties(
  properties: Record<string, AnalyticsValue | undefined>,
): Record<string, AnalyticsValue> {
  return Object.fromEntries(
    Object.entries(properties)
      .filter(([key, value]) => value !== undefined && key.length <= MAX_LENGTH)
      .map(([key, value]) => [key, clamp(value as AnalyticsValue)]),
  );
}
