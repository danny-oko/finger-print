import { NextResponse } from "next/server";

import { getPricingSettings } from "@/lib/registration/pricing";

export async function GET() {
  try {
    const settings = await getPricingSettings();
    return NextResponse.json(settings);
  } catch (error) {
    console.error("Failed to load pricing settings", error);
    return NextResponse.json(
      { pricePerAttendeeMnt: 15000, taxRatePercent: 0, currency: "MNT" },
      { status: 200 },
    );
  }
}
