import React from "react";
import { cn } from "@/lib/utils";

function FancyWord({ text }: { text: string }) {
  return (
    <div className="relative">
      <div
        aria-hidden
        className={cn(
          "select-none",
          "text-[clamp(52px,7vw,110px)] font-black leading-[0.9] tracking-tight",
          "text-white/10 blur-[0.2px]",
          "absolute -left-1 -top-1 rotate-[-2deg]",
        )}
      >
        {text}
      </div>

      <h2
        className={cn(
          "relative",
          "text-[clamp(52px,7vw,110px)] font-black leading-[0.9] tracking-tight",
          "rotate-[-2deg]",
        )}
      >
        <span className="bg-gradient-to-r from-white via-white to-white/70 bg-clip-text text-transparent">
          {text}
        </span>
        <span
          aria-hidden
          className={cn(
            "absolute inset-0",
            "text-transparent",
            "[text-stroke:1px_rgba(255,255,255,0.18)]",
            "[-webkit-text-stroke:1px_rgba(255,255,255,0.18)]",
          )}
        >
          {text}
        </span>
      </h2>
    </div>
  );
}

export default FancyWord;
