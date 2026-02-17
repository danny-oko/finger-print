// components/ScrollHighlightMarquee.tsx
"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

type Tone = "mint" | "orange" | "violet";

type TextChunk = { type: "text"; value: string };
type PillChunk = { type: "pill"; value: string; tone?: Tone };
export type Chunk = TextChunk | PillChunk;

const tones: Record<Tone, string> = {
  mint: "bg-emerald-400 text-black shadow-[0_18px_40px_rgba(0,0,0,.18)]",
  orange: "bg-orange-400 text-black shadow-[0_18px_40px_rgba(0,0,0,.18)]",
  violet: "bg-violet-200 text-black shadow-[0_18px_40px_rgba(0,0,0,.18)]",
};

export default function ScrollHighlightMarquee({
  chunks = [],
  className,
  pillClassName,
  textClassName,
}: {
  chunks?: Chunk[];
  className?: string;
  pillClassName?: string;
  textClassName?: string;
}) {
  if (!Array.isArray(chunks) || chunks.length === 0) return null;

  return (
    <div className={cn("w-full overflow-hidden", className)}>
      <div className="whitespace-nowrap">
        {chunks.map((c, i) =>
          c.type === "pill" ? (
            <span
              key={i}
              className={cn(
                "mx-2 inline-flex items-center rounded-2xl px-5 py-3 text-sm font-semibold",
                tones[c.tone ?? "mint"],
                pillClassName,
              )}
            >
              {c.value}
            </span>
          ) : (
            <span
              key={i}
              className={cn(
                "text-[clamp(18px,2.1vw,28px)] font-medium text-neutral-900",
                textClassName,
              )}
            >
              {c.value}
            </span>
          ),
        )}
      </div>
    </div>
  );
}
