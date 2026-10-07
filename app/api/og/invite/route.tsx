import { ImageResponse } from "next/og";
import type { NextRequest } from "next/server";

import { cleanFriendName } from "@/lib/invite/friendName";
import { OG_SIZE, ogFonts, RidgesCard } from "@/lib/og/card";

// The preview a friend sees in the chat before they tap — the same card as
// the page itself: their name, the event, the date. Nothing to decode.
export async function GET(request: NextRequest) {
  const to = cleanFriendName(request.nextUrl.searchParams.get("to"));

  return new ImageResponse(<RidgesCard lead={to ? `${to}, чамайг урьж байна` : "Чамайг урьж байна"} />, {
    ...OG_SIZE,
    fonts: await ogFonts(),
    // Chat apps fetch the card once with a short timeout; serve it from the CDN.
    headers: { "Cache-Control": "public, max-age=86400, s-maxage=604800, stale-while-revalidate=86400" },
  });
}
