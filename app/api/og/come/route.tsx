import { readFile } from "node:fs/promises";
import { join } from "node:path";

import { ImageResponse } from "next/og";
import type { NextRequest } from "next/server";

import { cleanFriendName } from "@/lib/come/friendName";
import {
  Chip,
  CREAM,
  INK,
  OG_SIZE,
  ORANGE,
  RED,
  TEAL,
  YELLOW,
  ogFonts,
} from "@/lib/og/card";

// Still frames of the page's GIFs — the card is a PNG, so they can't move.
async function sticker(name: string): Promise<string> {
  const data = await readFile(join(process.cwd(), "assets", "og", `${name}.png`));
  return `data:image/png;base64,${data.toString("base64")}`;
}

export async function GET(request: NextRequest) {
  const to = cleanFriendName(request.nextUrl.searchParams.get("to"));

  const [letter, pleading, sparkles, fonts] = await Promise.all([
    sticker("love-letter"),
    sticker("pleading"),
    sticker("sparkles"),
    ogFonts(),
  ]);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          position: "relative",
          background: CREAM,
          fontFamily: "Inter",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: -170,
            right: -120,
            width: 480,
            height: 480,
            borderRadius: 999,
            background: TEAL,
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: -190,
            right: 170,
            width: 340,
            height: 340,
            borderRadius: 999,
            background: YELLOW,
          }}
        />
        <div
          style={{
            position: "absolute",
            top: 330,
            right: -60,
            width: 170,
            height: 170,
            borderRadius: 999,
            background: RED,
          }}
        />

        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          alt=""
          src={letter}
          width={300}
          height={300}
          style={{ position: "absolute", top: 70, right: 70, transform: "rotate(-10deg)" }}
        />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          alt=""
          src={pleading}
          width={170}
          height={170}
          style={{ position: "absolute", bottom: 40, right: 300 }}
        />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          alt=""
          src={sparkles}
          width={90}
          height={90}
          style={{ position: "absolute", top: 380, right: 330 }}
        />

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            padding: "0 72px",
            width: 780,
            height: "100%",
          }}
        >
          <div
            style={{
              display: "flex",
              alignSelf: "flex-start",
              alignItems: "center",
              background: "white",
              border: `3px solid ${INK}`,
              borderRadius: 999,
              padding: "12px 28px",
              fontSize: 32,
              fontWeight: 800,
              color: INK,
              whiteSpace: "nowrap",
            }}
          >
            {to ? (
              <>
                <span>Хөөе,&nbsp;</span>
                <span style={{ color: ORANGE }}>{to}</span>
                <span>!</span>
              </>
            ) : (
              "Хөөе!"
            )}
          </div>

          <div
            style={{
              display: "flex",
              marginTop: 30,
              fontSize: 112,
              fontWeight: 800,
              lineHeight: 1,
              letterSpacing: -3,
              color: INK,
            }}
          >
            Надтай хамт
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 112,
              fontWeight: 800,
              lineHeight: 1.05,
              letterSpacing: -3,
              color: TEAL,
            }}
          >
            явах уу?
          </div>

          <div
            style={{
              display: "flex",
              marginTop: 22,
              fontSize: 32,
              color: INK,
              opacity: 0.7,
            }}
          >
            Чи Хурууны хээ 2026-д урилгатай!
          </div>

          <div style={{ display: "flex", gap: 14, marginTop: 30 }}>
            <Chip>2026.10.10</Chip>
            <Chip>09:00–17:00</Chip>
          </div>
        </div>
      </div>
    ),
    { ...OG_SIZE, fonts },
  );
}
