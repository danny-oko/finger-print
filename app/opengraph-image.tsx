import { ImageResponse } from "next/og";

import { EventCard, OG_SIZE, ogFonts } from "@/lib/og/card";
import { formatMnt } from "@/lib/registration/pricing";
import { getRegistrationSettings } from "@/lib/registration/settings";

export const alt = "Хурууны хээ 2026 — 2026.10.10";
export const size = OG_SIZE;
export const contentType = "image/png";

// Rendered on the server and cached for an hour, so the price on the card is
// whatever D1 actually says rather than a number baked in at deploy time.
export const revalidate = 3600;

async function price(): Promise<string> {
  try {
    const { pricePerAttendeeMnt } = (await getRegistrationSettings()).pricing;
    return formatMnt(pricePerAttendeeMnt);
  } catch {
    return formatMnt(15000);
  }
}

export default async function Image() {
  return new ImageResponse(
    (
      <EventCard
        eyebrow="FINGER PRINT"
        headline="ХУРУУНЫ ХЭЭ"
        year="2026"
        tagline="Зорилготой, зоригтой, зөвт залуучууд"
        chips={["2026.10.10", "09:00–17:00", await price()]}
      />
    ),
    { ...size, fonts: await ogFonts() },
  );
}
