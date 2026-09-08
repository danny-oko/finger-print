import { track } from "@vercel/analytics/server";

import {
  toAnalyticsProperties,
  type AnalyticsEventName,
  type AnalyticsEvents,
} from "@/lib/analytics/events";

/**
 * Sends one custom event from a route handler.
 *
 * Unlike the browser's beacon this is a real awaited HTTP request that can
 * reject — a network blip, or a 401 on a deployment-protected preview, where
 * `/_vercel/insights/event` is behind the protection check. Every rejection
 * is swallowed: these events sit next to a payment webhook that must return
 * 2xx quickly, and losing a metric is always cheaper than a retried payment.
 *
 * Prefer `waitUntil(trackServerEvent(...))` at call sites on a latency
 * budget — it keeps the event without making the response wait for it.
 */
export async function trackServerEvent<Name extends AnalyticsEventName>(
  name: Name,
  properties: AnalyticsEvents[Name],
): Promise<void> {
  try {
    await track(name, toAnalyticsProperties(properties));
  } catch (error) {
    console.error(`Analytics: failed to track "${name}"`, error);
  }
}
