"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

type Props = { value: string; className?: string };

export default function CountDownTile({ value, className }: Props) {
  return (
    <div
      className={cn(
        "relative grid place-items-center shrink-0",
        "h-[100px] w-[62px] sm:h-[120px] sm:w-[90px]",
        "rounded-2xl bg-white",
        "shadow-[0_22px_60px_rgba(0,0,0,0.22)]",
        className,
      )}
    >
      <div className="pointer-events-none absolute left-2 right-2 top-1/2 h-px bg-black/15" />
      <div className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-black/10" />
      <span className="text-[66px] font-black leading-none tabular-nums tracking-[-0.06em] sm:text-[84px]">
        {value}
      </span>
    </div>
  );
}
