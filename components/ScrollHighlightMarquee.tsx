// app/components/ScrollHighlightMarquee.tsx
"use client";

import * as React from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { cn } from "@/lib/utils";

type Chunk =
  | { type: "text"; value: string }
  | { type: "pill"; value: string; tone?: "mint" | "orange" | "violet" };

const tones: Record<NonNullable<Chunk["tone"]>, string> = {
  mint: "bg-emerald-400 text-black shadow-[0_18px_40px_rgba(0,0,0,.18)]",
  orange: "bg-orange-400 text-black shadow-[0_18px_40px_rgba(0,0,0,.18)]",
  violet: "bg-violet-200 text-black shadow-[0_18px_40px_rgba(0,0,0,.18)]",
};

function Pill({
  children,
  className,
  tone = "mint",
  rotate = 0,
  nudgeY = 0,
}: {
  children: React.ReactNode;
  className?: string;
  tone?: NonNullable<Chunk["tone"]>;
  rotate?: number;
  nudgeY?: number;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-2xl px-5 py-3 font-semibold leading-none",
        tones[tone],
        className,
      )}
      style={{ transform: `translateY(${nudgeY}px) rotate(${rotate}deg)` }}
    >
      {children}
    </span>
  );
}

export default function ScrollHighlightMarquee({
  chunks,
  className,
}: {
  chunks: Chunk[];
  className?: string;
}) {
  const sectionRef = React.useRef<HTMLElement | null>(null);
  const pinRef = React.useRef<HTMLDivElement | null>(null);
  const rowRef = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const section = sectionRef.current;
    const pin = pinRef.current;
    const row = rowRef.current;
    if (!section || !pin || !row) return;

    const ctx = gsap.context(() => {
      const getMaxX = () => Math.max(0, row.scrollWidth - pin.clientWidth);

      const tween = gsap.to(row, {
        x: () => -getMaxX(),
        ease: "none",
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: () => `+=${getMaxX() + window.innerHeight}`,
          scrub: 1,
          pin: pin,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      });

      ScrollTrigger.refresh();

      return () => {
        tween.scrollTrigger?.kill();
        tween.kill();
      };
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className={cn("w-full", className)}>
      <div
        ref={pinRef}
        className="relative h-screen w-full overflow-hidden bg-white"
      >
        <div className="flex h-full items-center">
          <div
            ref={rowRef}
            className="flex items-center gap-6 will-change-transform px-[6vw]"
          >
            <div className="flex items-center gap-6 whitespace-nowrap text-[12vw] font-semibold leading-[0.92] tracking-tight text-neutral-900 md:text-[8.5vw]">
              {chunks.map((c, i) => {
                if (c.type === "text") {
                  return (
                    <span key={i} className="whitespace-nowrap">
                      {c.value}
                    </span>
                  );
                }

                const style =
                  c.tone === "violet"
                    ? { rotate: -6, nudgeY: -8 }
                    : c.tone === "orange"
                      ? { rotate: 4, nudgeY: 10 }
                      : { rotate: -2, nudgeY: 6 };

                return (
                  <Pill
                    key={i}
                    tone={c.tone ?? "mint"}
                    rotate={style.rotate}
                    nudgeY={style.nudgeY}
                    className="text-[0.24em] md:text-[0.22em]"
                  >
                    {c.value}
                  </Pill>
                );
              })}
            </div>
          </div>
        </div>

        <div className="pointer-events-none absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-white to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-white to-transparent" />
      </div>
    </section>
  );
}
