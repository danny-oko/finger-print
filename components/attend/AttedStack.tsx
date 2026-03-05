"use client";

import * as React from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type { AttendItem } from "./types";
import AttendCard from "./AttendCard";

gsap.registerPlugin(ScrollTrigger);

export default function AttendStack({
  items,
  navOffset = 120,
}: {
  items: AttendItem[];
  navOffset?: number;
}) {
  const rootRef = React.useRef<HTMLDivElement | null>(null);
  const pinRef = React.useRef<HTMLDivElement | null>(null);

  React.useLayoutEffect(() => {
    const root = rootRef.current;
    const pin = pinRef.current;
    if (!root || !pin) return;

    const ctx = gsap.context(() => {
      const cards = gsap.utils.toArray<HTMLElement>("[data-attend-card]");

      // base stack pose
      cards.forEach((card, i) => {
        gsap.set(card, {
          y: i * 18,
          scale: 1 - i * 0.03,
          opacity: i === 0 ? 1 : 0.96,
          transformOrigin: "50% 100%",
          zIndex: 50 - i,
        });
      });

      const pinHeight = pin.getBoundingClientRect().height || 560;
      const scrollLen = Math.max(1, cards.length) * window.innerHeight * 0.8;

      // ✅ give the column REAL height (no fake spacer divs)
      gsap.set(root, { minHeight: pinHeight + scrollLen });

      ScrollTrigger.create({
        trigger: root,
        start: `top top+=${navOffset}`,
        end: `+=${scrollLen}`,
        pin: pin,
        pinSpacing: true,
        anticipatePin: 1,
        invalidateOnRefresh: true,
      });

      cards.forEach((card, i) => {
        const next = cards.slice(i + 1);

        ScrollTrigger.create({
          trigger: root,
          start: () =>
            `top+=${i * window.innerHeight * 0.55} top+=${navOffset}`,
          end: () =>
            `top+=${(i + 1) * window.innerHeight * 0.55} top+=${navOffset}`,
          scrub: true,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            const p = self.progress;

            gsap.to(card, {
              y: gsap.utils.interpolate(i * 18, -10, p),
              scale: gsap.utils.interpolate(1 - i * 0.03, 1, p),
              opacity: 1,
              duration: 0,
            });

            next.forEach((c, idx) => {
              gsap.to(c, {
                y: (i + 1 + idx) * 18 + p * 26,
                scale: 1 - (i + 1 + idx) * 0.03,
                opacity: 0.92,
                duration: 0,
              });
            });
          },
        });
      });

      // helps prevent first-enter jump after layout settles
      requestAnimationFrame(() => ScrollTrigger.refresh());
    }, root);

    return () => ctx.revert();
  }, [items.length, navOffset]);

  return (
    <div ref={rootRef} className="relative">
      {/* ✅ pinned viewport (NORMAL flow element, not absolute overlay) */}
      <div ref={pinRef} className="relative w-full max-w-[560px]">
        <div className="relative h-[520px] sm:h-[560px]">
          {items.map((item) => (
            <div key={item.title} className="absolute inset-0">
              <AttendCard item={item} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
