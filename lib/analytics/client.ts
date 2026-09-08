"use client";

import { track } from "@vercel/analytics";

import {
  toAnalyticsProperties,
  type AnalyticsEventName,
  type AnalyticsEvents,
} from "@/lib/analytics/events";

/**
 * Sends one custom event from the browser. Fire-and-forget by design: the
 * beacon is best-effort, and a blocked or failed request must never surface
 * to someone in the middle of registering.
 *
 * `<Analytics />` in the root layout is what actually loads the script, so
 * calls made before it mounts (or in development, where it no-ops) are
 * simply dropped.
 */
export function trackEvent<Name extends AnalyticsEventName>(
  name: Name,
  properties: AnalyticsEvents[Name],
): void {
  try {
    track(name, toAnalyticsProperties(properties));
  } catch {
    // Ad blockers reject the request outright — not worth a console error.
  }
}
