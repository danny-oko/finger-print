// Pure pricing maths, shared by the form, the review dialog and the server.
// The numbers themselves come from D1 — see settings.ts.

export type PricingSettings = {
  pricePerAttendeeMnt: number;
  taxRatePercent: number;
  currency: string;
};

export type PricingBreakdown = PricingSettings & {
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
    ...settings,
    attendeeCount,
    subtotalMnt,
    taxMnt,
    totalMnt: subtotalMnt + taxMnt,
  };
}

export function formatMnt(amount: number): string {
  return `${amount.toLocaleString("mn-MN")}₮`;
}
