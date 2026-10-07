import { readFile } from "node:fs/promises";
import { join } from "node:path";

import { EVENT } from "@/lib/event";
import { fingerprintSvg } from "@/lib/invite/ridges";

// One card design, shared by every share preview. Chat apps render these
// small — a Messenger card is a few hundred pixels wide on a phone — so this
// is built around three or four big things, not a reproduction of the poster.

export const OG_SIZE = { width: 1200, height: 630 };

export const CREAM = "#F2EDE1";
export const INK = "#14161A";
export const TEAL = "#37A8C4";
export const YELLOW = "#F7C948";
export const RED = "#E04434";
export const ORANGE = "#F98C01";

export async function ogFonts() {
  const [regular, extraBold] = await Promise.all([
    readFile(join(process.cwd(), "assets", "Inter-Regular.ttf")),
    readFile(join(process.cwd(), "assets", "Inter-ExtraBold.ttf")),
  ]);

  // Bundled rather than fetched: the built-in font has no bold and no ₮, and
  // a crawler shouldn't be waiting on Google Fonts to render a preview.
  return [
    { name: "Inter", data: regular, weight: 400 as const, style: "normal" as const },
    { name: "Inter", data: extraBold, weight: 800 as const, style: "normal" as const },
  ];
}

export function Chip({ children }: { children: string }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        border: `3px solid ${INK}`,
        borderRadius: 999,
        padding: "10px 26px",
        fontSize: 30,
        fontWeight: 800,
        whiteSpace: "nowrap",
        color: INK,
      }}
    >
      {children}
    </div>
  );
}

export function EventCard({
  eyebrow,
  headline,
  year,
  tagline,
  chips,
}: {
  eyebrow: string;
  headline: string;
  year: string;
  tagline: string;
  chips: string[];
}) {
  return (
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
      {/* Circles bleeding off the right edge, echoing the printed poster. */}
      <div
        style={{
          position: "absolute",
          top: -150,
          right: -110,
          width: 420,
          height: 420,
          borderRadius: 999,
          background: TEAL,
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: -170,
          right: 90,
          width: 330,
          height: 330,
          borderRadius: 999,
          background: YELLOW,
        }}
      />
      <div
        style={{
          position: "absolute",
          top: 300,
          right: -70,
          width: 190,
          height: 190,
          borderRadius: 999,
          background: RED,
        }}
      />

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "0 72px",
          width: 860,
          height: "100%",
        }}
      >
        <div
          style={{
            display: "flex",
            fontSize: 26,
            fontWeight: 800,
            letterSpacing: 6,
            color: ORANGE,
          }}
        >
          {eyebrow}
        </div>

        <div
          style={{
            display: "flex",
            marginTop: 18,
            fontSize: 116,
            fontWeight: 800,
            lineHeight: 1,
            letterSpacing: -3,
            color: INK,
          }}
        >
          {headline}
        </div>

        <div
          style={{
            display: "flex",
            fontSize: 116,
            fontWeight: 800,
            lineHeight: 1.05,
            letterSpacing: -3,
            color: TEAL,
          }}
        >
          {year}
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
          {tagline}
        </div>

        <div style={{ display: "flex", gap: 14, marginTop: 34 }}>
          {chips.map((chip) => (
            <Chip key={chip}>{chip}</Chip>
          ))}
        </div>
      </div>
    </div>
  );
}

// The invite card's design: orange, fingerprint ridges, the event and its date.
export function RidgesCard({ lead }: { lead: string }) {
  const ridges = `data:image/svg+xml;base64,${Buffer.from(fingerprintSvg("rgba(20,22,26,0.16)", 3)).toString("base64")}`;

  return (
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
        <div style={{ display: "flex", fontSize: 40, fontWeight: 400 }}>{lead}</div>
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
  );
}
