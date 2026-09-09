import { ImageResponse } from "next/og";

import { EventCard, OG_SIZE, ogFonts } from "@/lib/og/card";
import { formatMnt, getPricingSettings } from "@/lib/registration/pricing";

export const alt = "Хурууны хээ 2026 — онлайн бүртгэл";
export const size = OG_SIZE;
export const contentType = "image/png";

export const revalidate = 3600;

export default async function Image() {
  let price = formatMnt(15000);
  try {
    price = formatMnt((await getPricingSettings()).pricePerAttendeeMnt);
  } catch {
    // The card is still worth rendering with the standing price.
  }

  return new ImageResponse(
    (
      <EventCard
        eyebrow="ОНЛАЙН БҮРТГЭЛ"
        headline="ХУРУУНЫ ХЭЭ"
        year="2026"
        tagline="Бүртгүүлээд тасалбараа аваарай"
        chips={["2026.10.10", "09:00–17:00", price]}
      />
    ),
    { ...size, fonts: await ogFonts() },
  );
}
