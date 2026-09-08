import { track } from "@vercel/analytics/server";

import {
  toAnalyticsProperties,
  type AnalyticsEventName,
  type AnalyticsEvents,
} from "@/lib/analytics/events";

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
