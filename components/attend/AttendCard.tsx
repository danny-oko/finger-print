// app/components/attend/AttendCard.tsx
"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import type { AttendItem } from "./types";

export default function AttendCard({
  item,
  className,
}: {
  item: AttendItem;
  className?: string;
}) {
  return (
    <article
      data-attend-card
      className={cn(
        "rounded-3xl border border-border bg-background/90 backdrop-blur",
        "shadow-[0_22px_60px_rgba(0,0,0,0.08)]",
        "p-6 sm:p-8",
        className,
      )}
    >
      <h3 className="text-lg font-semibold tracking-tight text-foreground sm:text-xl">
        {item.title}
      </h3>
      <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
        {item.desc}
      </p>
    </article>
  );
}
