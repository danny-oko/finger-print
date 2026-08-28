import { d1Query } from "@/lib/d1";

export type PricingSettings = {
  pricePerAttendeeMnt: number;
  taxRatePercent: number;
  currency: string;
};

const DEFAULTS: PricingSettings = {
  pricePerAttendeeMnt: 15000,
  taxRatePercent: 0,
  currency: "MNT",
};

export async function getPricingSettings(): Promise<PricingSettings> {
  const rows = await d1Query<{ key: string; value: string }>(
    "SELECT key, value FROM settings WHERE key IN ('price_per_attendee_mnt', 'tax_rate_percent', 'currency')",
  );

  const map = Object.fromEntries(rows.map((r) => [r.key, r.value]));

  return {
    pricePerAttendeeMnt: Number(map.price_per_attendee_mnt ?? DEFAULTS.pricePerAttendeeMnt),
    taxRatePercent: Number(map.tax_rate_percent ?? DEFAULTS.taxRatePercent),
    currency: map.currency ?? DEFAULTS.currency,
  };
}

export type PricingBreakdown = {
  pricePerAttendeeMnt: number;
  taxRatePercent: number;
  currency: string;
  attendeeCount: number;
  subtotalMnt: number;
  taxMnt: number;
  totalMnt: number;
};

export function computePricing(
  settings: PricingSettings,
  attendeeCount: number,
): PricingBreakdown {
  const subtotalMnt = settings.pricePerAttendeeMnt * attendeeCount;
  const taxMnt = Math.round((subtotalMnt * settings.taxRatePercent) / 100);

  return {
    pricePerAttendeeMnt: settings.pricePerAttendeeMnt,
    taxRatePercent: settings.taxRatePercent,
    currency: settings.currency,
    attendeeCount,
    subtotalMnt,
    taxMnt,
    totalMnt: subtotalMnt + taxMnt,
  };
}

export function formatMnt(amount: number): string {
  return `${amount.toLocaleString("mn-MN")}₮`;
}
