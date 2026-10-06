import { ImageResponse } from "next/og";
import type { NextRequest } from "next/server";

import { cleanFriendName } from "@/lib/invite/friendName";
import { fingerprintSvg } from "@/lib/invite/ridges";
import { EVENT } from "@/lib/event";
import { INK, OG_SIZE, ORANGE, ogFonts } from "@/lib/og/card";

// The preview a friend sees in the chat before they tap — the same card as
// the page itself: their name, the event, the date. Nothing to decode.
export async function GET(request: NextRequest) {
  const to = cleanFriendName(request.nextUrl.searchParams.get("to"));
  const fonts = await ogFonts();
  const ridges = `data:image/svg+xml;base64,${Buffer.from(fingerprintSvg("rgba(20,22,26,0.16)", 3)).toString("base64")}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          position: "relative",
          background: ORANGE,
          fontFamily: "Inter",
          color: INK,
          overflow: "hidden",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img alt="" src={ridges} width={620} height={744} style={{ position: "absolute", top: -60, right: -150 }} />

        <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", padding: "0 80px", width: 900 }}>
          <div style={{ display: "flex", fontSize: 40, fontWeight: 400 }}>
            {to ? `${to}, чамайг урьж байна` : "Чамайг урьж байна"}
          </div>
          <div style={{ display: "flex", marginTop: 26, fontSize: 132, fontWeight: 800, lineHeight: 0.98, letterSpacing: -4 }}>
            Хурууны
          </div>
          <div style={{ display: "flex", fontSize: 132, fontWeight: 800, lineHeight: 1.02, letterSpacing: -4 }}>
            хээ 2026
          </div>
          <div style={{ display: "flex", marginTop: 34, fontSize: 36, opacity: 0.8 }}>
            {`${EVENT.dateShort}, ${EVENT.weekday}, ${EVENT.time}`}
          </div>
        </div>
      </div>
    ),
    {
      ...OG_SIZE,
      fonts,
      // Chat apps fetch the card once with a short timeout; serve it from the CDN.
      headers: { "Cache-Control": "public, max-age=86400, s-maxage=604800, stale-while-revalidate=86400" },
    },
  );
}
