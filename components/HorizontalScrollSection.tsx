"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

type Props = {
  items: string[];
  className?: string;
};

export default function HorizontalScrollSection({ items, className }: Props) {
  const sectionRef = React.useRef<HTMLElement | null>(null);
  const trackRef = React.useRef<HTMLDivElement | null>(null);

  const targetX = React.useRef(0);
  const currentX = React.useRef(0);
  const rafId = React.useRef<number | null>(null);

  React.useEffect(() => {
    const section = sectionRef.current;
    const track = trackRef.current;
    if (!section || !track) return;

    const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

    const measure = () => {
      const total = items.length;
      section.style.height = `${Math.max(1, total) * 100}vh`;
    };

    const updateTarget = () => {
      const rect = section.getBoundingClientRect();
      const viewH = window.innerHeight;

      const totalScroll = section.offsetHeight - viewH;
      if (totalScroll <= 0) {
        targetX.current = 0;
        return;
      }

      const scrolled = -rect.top;
      const p = clamp01(scrolled / totalScroll);

      const maxX = track.scrollWidth - window.innerWidth;
      targetX.current = -maxX * p;
    };

    const tick = () => {
      currentX.current += (targetX.current - currentX.current) * 0.08;
      track.style.transform = `translate3d(${currentX.current}px,0,0)`;
      rafId.current = window.requestAnimationFrame(tick);
    };

    measure();
    updateTarget();
    rafId.current = window.requestAnimationFrame(tick);

    const onScroll = () => updateTarget();
    const onResize = () => {
      measure();
      updateTarget();
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      if (rafId.current) window.cancelAnimationFrame(rafId.current);
    };
  }, [items.length]);

  return (
    <section ref={sectionRef} className={cn("relative w-full", className)}>
      <div className="sticky top-0 h-screen overflow-hidden">
        <div ref={trackRef} className="flex h-full will-change-transform">
          {items.map((text, i) => (
            <div
              key={i}
              className="flex h-screen w-screen flex-none items-center"
            >
              <div className="mx-auto w-[min(1200px,92vw)]">
                <p className="text-4xl font-semibold leading-[1.08] tracking-tight md:text-6xl">
                  {text}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
