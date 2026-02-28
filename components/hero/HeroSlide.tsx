"use client";

import { cn } from "@/lib/utils";
import HeroContent from "./HeroContent";
import HeroMedia from "./HeroMedia";
import HeroOverlay from "./HeroOverlay";
import ImageSlideCaption from "./ImageSlideCaption";
import { CONTAINER, Slide } from "./types";

export default function HeroSlide({
  slide,
  index,
}: {
  slide: Slide;
  index: number;
}) {
  return (
    <div
      className={cn(
        "relative isolate overflow-hidden rounded-sm",
        "h-[90vh] min-h-[400px] sm:min-h-[500px] md:min-h-[560px] w-full",
      )}
    >
      <HeroMedia slide={slide} priority={index === 0} />
      <HeroOverlay />

      <div className="relative z-10 h-full">
        <div className={cn(CONTAINER, "h-full")}>
          <div
            className="flex h-full items-end"
            style={{
              paddingTop:
                "calc(var(--nav-h, 80px) + var(--nav-gap, 24px) + 12px)",
            }}
          >
            <div className="w-full pb-14 md:pb-16">
              {index === 0 ? (
                <HeroContent />
              ) : (
                <ImageSlideCaption index={index} />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
