"use client";

import { AttendItem } from "./types";

interface AttendCardProps {
  item: AttendItem;
  index: number;
  total: number;
}

// Each card gets a unique soft background tint
const CARD_PALETTES = [
  { bg: "#FFFFFF", border: "rgba(108,99,255,0.15)", accent: "#6C63FF" },
  { bg: "#F8F7FF", border: "rgba(108,99,255,0.12)", accent: "#4F46E5" },
  { bg: "#F0EFFE", border: "rgba(79,70,229,0.18)", accent: "#3730A3" },
];

export default function AttendCard({ item, index, total }: AttendCardProps) {
  const palette = CARD_PALETTES[index % CARD_PALETTES.length];

  return (
    <div
      className="attend-card w-full rounded-3xl border p-8 md:p-10 shadow-xl will-change-transform"
      data-index={index}
      style={{
        background: palette.bg,
        borderColor: palette.border,
        boxShadow:
          "0 4px 6px rgba(0,0,0,0.04), 0 12px 40px rgba(0,0,0,0.08), 0 0 0 1px rgba(255,255,255,0.8) inset",
        // Stack offset so cards peek behind each other before animation
        transformOrigin: "top center",
      }}
    >
      {/* Card number pill */}
      <div className="flex items-start justify-between mb-8">
        <span
          className="inline-flex items-center justify-center w-10 h-10 rounded-2xl text-sm font-bold text-white shadow-md"
          style={{
            background: `linear-gradient(135deg, ${palette.accent}CC 0%, ${palette.accent} 100%)`,
            boxShadow: `0 4px 12px ${palette.accent}40`,
          }}
        >
          {index + 1}
        </span>

        {/* Decorative step indicator */}
        <span
          className="text-xs font-medium tracking-widest uppercase"
          style={{
            color: palette.accent,
            fontFamily: "'Noto Sans', system-ui, sans-serif",
            opacity: 0.6,
          }}
        >
          {index + 1} / {total}
        </span>
      </div>

      {/* Title */}
      <h3
        className="text-2xl md:text-3xl font-bold mb-4 leading-snug"
        style={{
          fontFamily: "'Noto Sans Mongolian', 'Noto Sans', Georgia, serif",
          color: "#0F0F0F",
          letterSpacing: "-0.01em",
        }}
      >
        {item.title}
      </h3>

      {/* Divider */}
      <div
        className="w-12 h-0.5 mb-5 rounded-full"
        style={{ background: palette.accent, opacity: 0.35 }}
      />

      {/* Body */}
      <p
        className="text-base leading-relaxed"
        style={{
          fontFamily: "'Noto Sans', system-ui, sans-serif",
          color: "#4A4A5E",
          maxWidth: "38ch",
        }}
      >
        {item.body}
      </p>

      {/* Bottom decoration */}
      <div
        className="mt-10 pt-6 border-t flex items-center gap-2"
        style={{ borderColor: "rgba(0,0,0,0.06)" }}
      >
        <div
          className="flex gap-1"
          aria-hidden="true"
        >
          {Array.from({ length: total }).map((_, i) => (
            <div
              key={i}
              className="rounded-full transition-all duration-300"
              style={{
                width: i === index ? 20 : 6,
                height: 6,
                background: i === index ? palette.accent : `${palette.accent}30`,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
