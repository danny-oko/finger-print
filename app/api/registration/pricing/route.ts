import { NextResponse } from "next/server";

import { logServerError } from "@/lib/errors";
import { getPricingSettings } from "@/lib/registration/pricing";

export async function GET() {
  try {
    const settings = await getPricingSettings();
    return NextResponse.json(settings);
  } catch (error) {
    // Falling back to the defaults keeps the price bar honest for the common
    // case; the create route reads settings again and fails loudly if D1 is
    // still down, so nobody is charged from a stale number.
    logServerError("pricing.read", error, { degraded: "defaults" });
    return NextResponse.json(
      { pricePerAttendeeMnt: 15000, taxRatePercent: 0, currency: "MNT" },
      { status: 200 },
    );
  }
}
