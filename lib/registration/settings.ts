import { cached } from "@/lib/cache";
import { d1Batch, d1Query } from "@/lib/db/d1";
import type { PricingSettings } from "@/lib/registration/pricing";

// Everything an organiser can change without a redeploy lives in D1's
// `settings` table as key/value text. Read through a short cache: every
// visitor to the form needs these, and they change a handful of times a year.

export const REGISTRATION_STATES = ["open", "paused", "closed"] as const;
export type RegistrationState = (typeof REGISTRATION_STATES)[number];

export const QUEUE_MODES = ["auto", "off"] as const;
export type QueueMode = (typeof QUEUE_MODES)[number];

export type RegistrationSettings = {
  pricing: PricingSettings;
  state: RegistrationState;
  capacity: number | null;
  queue: { mode: QueueMode; admitPerMinute: number; burst: number };
};

export const DEFAULT_SETTINGS: RegistrationSettings = {
  pricing: { pricePerAttendeeMnt: 15000, taxRatePercent: 0, currency: "MNT" },
  state: "open",
  capacity: null,
  // ~20/min keeps a full registration (create, payment webhook, ticket page
  // polls — about 14 D1 requests end to end) inside Cloudflare's 1,200 per
  // 5 minutes, with room for the admin dashboard and the door scanner.
  queue: { mode: "auto", admitPerMinute: 20, burst: 10 },
};

const KEYS = {
  price: "price_per_attendee_mnt",
  tax: "tax_rate_percent",
  currency: "currency",
  state: "registration_state",
  capacity: "capacity",
  queueMode: "queue_mode",
  queueRate: "queue_admit_per_minute",
  queueBurst: "queue_burst",
} as const;

function positiveInt(raw: string | undefined, fallback: number): number {
  const n = Number(raw);
  return Number.isInteger(n) && n > 0 ? n : fallback;
}

function oneOf<T extends string>(raw: string | undefined, options: readonly T[], fallback: T): T {
  return options.includes(raw as T) ? (raw as T) : fallback;
}

function parse(map: Record<string, string>): RegistrationSettings {
  const d = DEFAULT_SETTINGS;
  const price = Number(map[KEYS.price]);
  const tax = Number(map[KEYS.tax]);

  return {
    pricing: {
      pricePerAttendeeMnt: Number.isFinite(price) && price >= 0 ? price : d.pricing.pricePerAttendeeMnt,
      taxRatePercent: Number.isFinite(tax) && tax >= 0 ? tax : d.pricing.taxRatePercent,
      currency: map[KEYS.currency] || d.pricing.currency,
    },
    state: oneOf(map[KEYS.state], REGISTRATION_STATES, d.state),
    capacity: map[KEYS.capacity] ? positiveInt(map[KEYS.capacity], 0) || null : null,
    queue: {
      mode: oneOf(map[KEYS.queueMode], QUEUE_MODES, d.queue.mode),
      admitPerMinute: positiveInt(map[KEYS.queueRate], d.queue.admitPerMinute),
      burst: positiveInt(map[KEYS.queueBurst], d.queue.burst),
    },
  };
}

const SETTINGS_TTL_MS = 15_000;

export const getRegistrationSettings = cached(SETTINGS_TTL_MS, async () => {
  const rows = await d1Query<{ key: string; value: string }>(
    `SELECT key, value FROM settings WHERE key IN (${Object.values(KEYS)
      .map(() => "?")
      .join(", ")})`,
    Object.values(KEYS),
  );
  return parse(Object.fromEntries(rows.map((r) => [r.key, r.value])));
});

export type SettingsPatch = {
  state?: RegistrationState;
  capacity?: number | null;
  queue?: Partial<RegistrationSettings["queue"]>;
};

export async function updateRegistrationSettings(patch: SettingsPatch): Promise<RegistrationSettings> {
  const entries: [string, string][] = [];

  if (patch.state) entries.push([KEYS.state, patch.state]);
  if (patch.capacity !== undefined) entries.push([KEYS.capacity, patch.capacity ? String(patch.capacity) : ""]);
  if (patch.queue?.mode) entries.push([KEYS.queueMode, patch.queue.mode]);
  if (patch.queue?.admitPerMinute) entries.push([KEYS.queueRate, String(patch.queue.admitPerMinute)]);
  if (patch.queue?.burst) entries.push([KEYS.queueBurst, String(patch.queue.burst)]);

  if (entries.length > 0) {
    await d1Batch(
      entries.map(([key, value]) => ({
        sql: "INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value",
        params: [key, value],
      })),
      { idempotent: true },
    );
  }

  // Only this instance forgets right away; the rest catch up within the TTL.
  getRegistrationSettings.invalidate();
  return getRegistrationSettings();
}
