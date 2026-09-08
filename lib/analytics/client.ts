"use client";

import { track } from "@vercel/analytics";

import {
  toAnalyticsProperties,
  type AnalyticsEventName,
  type AnalyticsEvents,
} from "@/lib/analytics/events";
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
