import { readFile } from "node:fs/promises";
import { join } from "node:path";

// One card design, shared by every share preview. Chat apps render these
// small — a Messenger card is a few hundred pixels wide on a phone — so this
// is built around three or four big things, not a reproduction of the poster.

export const OG_SIZE = { width: 1200, height: 630 };

const CREAM = "#F2EDE1";
const INK = "#14161A";
const TEAL = "#37A8C4";
const YELLOW = "#F7C948";
const RED = "#E04434";
const ORANGE = "#F98C01";

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

function Chip({ children }: { children: string }) {
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
