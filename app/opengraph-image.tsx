import { ImageResponse } from "next/og";

import { OG_SIZE, ogFonts, RidgesCard } from "@/lib/og/card";

export const alt = "Хурууны хээ 2026 — 2026.10.10";
export const size = OG_SIZE;
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(<RidgesCard lead="Өсвөрийн чуулган" />, {
    ...size,
    fonts: await ogFonts(),
  });
}
