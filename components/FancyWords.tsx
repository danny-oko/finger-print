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
          "text-[#F98C01]/15 blur-[0.2px]",
          "absolute -left-1 -top-1 -rotate-2",
        )}
      >
        {text}
      </div>

      <h2
        className={cn(
          "relative",
          "text-[clamp(52px,7vw,110px)] font-black leading-[0.9] tracking-tight",
          "-rotate-2",
          "drop-shadow-[0_24px_40px_rgba(0,0,0,0.65)]",
        )}
      >
        <span className="bg-linear-to-r from-[#FFB347] via-[#F98C01] to-[#F98C01] bg-clip-text text-transparent">
          {text}
        </span>
        <span
          aria-hidden
          className={cn(
            "absolute inset-0",
            "text-transparent",
            "[text-stroke:1px_rgba(249,140,1,0.55)]",
            "[-webkit-text-stroke:1px_rgba(249,140,1,0.55)]",
          )}
        >
          {text}
        </span>
      </h2>
    </div>
  );
}

export default FancyWord;
