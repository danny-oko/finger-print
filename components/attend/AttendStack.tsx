"use client";

import { useLayoutEffect, useRef } from "react";
import AttendCard from "./AttendCard";
import { AttendItem } from "./types";

interface AttendStackProps {
  items: AttendItem[];
  navOffset?: number;
}

export default function AttendStack({
  items,
  navOffset = 112,
}: AttendStackProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const pinRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    // Dynamically import GSAP to avoid SSR issues
    let ctx: any;

    const init = async () => {
      const { default: gsap } = await import("gsap");
      const { ScrollTrigger } = await import("gsap/ScrollTrigger");
      gsap.registerPlugin(ScrollTrigger);

      if (!containerRef.current || !pinRef.current) return;

      ctx = gsap.context(() => {
        const cards =
          pinRef.current!.querySelectorAll<HTMLElement>(".attend-card");
        const CARD_HEIGHT = pinRef.current!.offsetHeight;
        const SCROLL_PER_CARD = CARD_HEIGHT * 0.85;

        cards.forEach((card, i) => {
          if (i === 0) return; // first card is flush
          gsap.set(card, {
            y: i * 18,
            scale: 1 - i * 0.04,
            opacity: 1 - i * 0.15,
            zIndex: cards.length - i,
          });
        });

        gsap.set(cards[0], { zIndex: cards.length, y: 0, scale: 1 });

        ScrollTrigger.create({
          trigger: containerRef.current,
          start: `top ${navOffset}px`,
          end: `+=${SCROLL_PER_CARD * (items.length - 1)}`,
          pin: pinRef.current,
          pinSpacing: false,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        });

        // Animate each card transition
        cards.forEach((card, i) => {
          if (i >= cards.length - 1) return;

          const tl = gsap.timeline({
            scrollTrigger: {
              trigger: containerRef.current,
              start: `top+=${SCROLL_PER_CARD * i} ${navOffset}px`,
              end: `top+=${SCROLL_PER_CARD * (i + 1)} ${navOffset}px`,
              scrub: 0.6,
              invalidateOnRefresh: true,
            },
          });

          tl.to(
            card,
            {
              y: -CARD_HEIGHT * 0.55,
              scale: 0.92,
              opacity: 0,
              zIndex: 0,
              ease: "power2.inOut",
            },
            0,
          );

          const remaining = Array.from(cards).slice(i + 1);
          remaining.forEach((rCard, ri) => {
            tl.to(
              rCard,
              {
                y: ri * 18,
                scale: 1 - ri * 0.04,
                opacity: 1 - ri * 0.15,
                zIndex: cards.length - ri,
                ease: "power2.inOut",
              },
              0,
            );
          });
        });

        ScrollTrigger.refresh();
      }, containerRef);
    };

    init();

    return () => {
      ctx?.revert();
    };
  }, [items, navOffset]);

  return (
    <div
      ref={containerRef}
      className="relative w-full"
      style={{
        minHeight: `calc(600px + ${(items.length - 1) * 85}vh)`,
      }}
    >
      <div ref={pinRef} className="w-full" style={{ position: "relative" }}>
        <div className="relative w-full" style={{ minHeight: 480 }}>
          {items.map((item, i) => (
            <div
              key={item.id}
              className="absolute inset-0"
              style={{ zIndex: items.length - i }}
            >
              <AttendCard item={item} index={i} total={items.length} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
