// app/components/HeroVideo.tsx
"use client";

import React from "react";
import { cn } from "@/lib/utils";

type Props = {
  src: string;
  poster?: string;
  className?: string;
  overlayClassName?: string;
  children?: React.ReactNode;
};

export default function HeroVideo({
  src,
  poster,
  className,
  overlayClassName,
  children,
}: Props) {
  return (
    <section
      className={cn(
        "relative isolate overflow-hidden rounded-3xl",
        "h-[90vh] min-h-[560px] w-full",
        className,
      )}
    >
      <video
        className="absolute inset-0 h-full w-full object-cover"
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        poster={poster}
      >
        <source src={src} type="video/mp4" />
      </video>

      <div className={cn("absolute inset-0 bg-black/35", overlayClassName)} />

      <div className="relative z-10 h-full">
        <div className="mx-auto h-full w-[min(1120px,92vw)]">
          {/* this keeps content out from under the navbar */}
          <div
            className="flex h-full items-end"
            style={{ paddingTop: "calc(var(--nav-h) + var(--nav-gap) + 12px)" }}
          >
            <div className="pb-14 md:pb-16 w-full">{children}</div>
          </div>
        </div>
      </div>
    </section>
  );
}
