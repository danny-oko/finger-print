import { logServerError } from "@/lib/errors";
import { getQueueConfig } from "@/lib/queue/waitingRoom";
import { getAvailability, type Availability } from "@/lib/registration/availability";
import { listChurches } from "@/lib/registration/churches";
import type { PricingSettings } from "@/lib/registration/pricing";
import { DEFAULT_SETTINGS, getRegistrationSettings } from "@/lib/registration/settings";

export type RegistrationBootstrap = {
  pricing: PricingSettings;
  availability: Availability;
  churches: string[];
  queue: boolean;
};

export async function getRegistrationBootstrap(): Promise<RegistrationBootstrap> {
  const [settings, availability, churches, queue] = await Promise.allSettled([
    getRegistrationSettings(),
    getAvailability(),
    listChurches(),
    getQueueConfig(),
  ]);

  for (const result of [settings, availability, churches, queue]) {
    if (result.status === "rejected") logServerError("registration.bootstrap", result.reason);
  }

  return {
    pricing: settings.status === "fulfilled" ? settings.value.pricing : DEFAULT_SETTINGS.pricing,
    availability:
      availability.status === "fulfilled"
        ? availability.value
        : { status: "open", capacity: null, seatsLeft: null },
    churches: churches.status === "fulfilled" ? churches.value : [],
    queue: queue.status === "fulfilled" && queue.value.active,
  };
}
