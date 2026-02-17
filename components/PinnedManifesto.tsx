// app/components/PinnedManifesto.tsx
"use client";

import * as React from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { cn } from "@/lib/utils";

gsap.registerPlugin(ScrollTrigger);

const CONTAINER = "mx-auto w-[min(80vw,1200px)]";

type Tone = "mint" | "violet" | "orange";

type Chunk =
  | { type: "text"; value: string }
  | { type: "pill"; value: string; tone: Tone };

function Pill({ value, tone }: { value: string; tone: Tone }) {
  const toneClass =
    tone === "mint"
      ? "bg-emerald-300"
      : tone === "violet"
        ? "bg-violet-200"
        : "bg-orange-300";

  return (
    <span
      className={cn(
        "mx-4 inline-flex items-center rounded-2xl px-7 py-4",
        "text-[clamp(22px,2.4vw,34px)] font-semibold leading-none text-black",
        "shadow-[0_18px_40px_rgba(0,0,0,.12)]",
        toneClass,
      )}
    >
      {value}
    </span>
  );
}

function TrackLine({ chunks }: { chunks: Chunk[] }) {
  return (
    <div className="flex items-center whitespace-nowrap">
      {chunks.map((c, i) =>
        c.type === "text" ? (
          <span
            key={i}
            className="text-[clamp(52px,8.8vw,132px)] font-semibold tracking-tight text-neutral-900"
          >
            {c.value}
          </span>
        ) : (
          <Pill key={i} value={c.value} tone={c.tone} />
        ),
      )}
    </div>
  );
}

export default function PinnedManifesto({
  className,
  label = "Why it matters",
  height = "70vh",
  chunks = [
    { type: "text", value: "Adolescence is a defining season where" },
    { type: "pill", value: "identity", tone: "mint" },
    { type: "text", value: "is shaped, where" },
    { type: "pill", value: "worth", tone: "violet" },
    { type: "text", value: "is discovered, and faith is anchored in" },
    { type: "pill", value: "Christ", tone: "orange" },
    { type: "text", value: "." },
  ] as Chunk[],
}: {
  className?: string;
  label?: string;
  height?: string;
  chunks?: Chunk[];
}) {
  const sectionRef = React.useRef<HTMLElement | null>(null);
  const trackRef = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    const section = sectionRef.current;
    const track = trackRef.current;
    if (!section || !track) return;

    const reduceMotion =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;

    if (reduceMotion) return;

    const ctx = gsap.context(() => {
      const compute = () => Math.max(0, track.scrollWidth - window.innerWidth);

      const tween = gsap.to(track, {
        x: () => -compute(),
        ease: "none",
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: () => `+=${Math.max(900, compute() * 1.1)}`,
          scrub: 1,
          pin: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      });

      const onRefreshInit = () => {
        tween.invalidate();
      };

      ScrollTrigger.addEventListener("refreshInit", onRefreshInit);

      return () => {
        ScrollTrigger.removeEventListener("refreshInit", onRefreshInit);
      };
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className={cn("relative w-full bg-white", className)}
    >
      <div className={cn(CONTAINER, "pt-10")}></div>

      <div className="relative mt-4 w-full overflow-hidden" style={{ height }}>
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-[10vw] bg-gradient-to-r from-white to-white/0" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-[10vw] bg-gradient-to-l from-white to-white/0" />

        <div ref={trackRef} className="flex h-full items-center px-[10vw]">
          <div className="flex items-center gap-20">
            <TrackLine chunks={chunks} />
          </div>
        </div>
      </div>

      <div className={cn(CONTAINER, "pb-16")} />
    </section>
  );
}
