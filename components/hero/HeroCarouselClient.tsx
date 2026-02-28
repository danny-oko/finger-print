"use client";

import {
  Carousel,
  CarouselApi,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { cn } from "@/lib/utils";
import * as React from "react";

import HeroSlide from "./HeroSlide";
import { Slide } from "./types";

export default function HeroCarouselClient({ slides }: { slides: Slide[] }) {
  const [api, setApi] = React.useState<CarouselApi | null>(null);
  const [active, setActive] = React.useState(0);

  React.useEffect(() => {
    if (!api) return;

    const onSelect = () => setActive(api.selectedScrollSnap());
    onSelect();

    api.on("select", onSelect);
    api.on("reInit", onSelect);

    return () => {
      api.off("select", onSelect);
      api.off("reInit", onSelect);
    };
  }, [api]);

  React.useEffect(() => {
    if (!api || slides.length <= 1) return;

    const id = window.setInterval(() => {
      api.scrollNext();
    }, 15000);

    return () => window.clearInterval(id);
  }, [api, slides.length]);

  return (
    <div className="mx-auto w-full">
      <Carousel
        setApi={setApi}
        opts={{ loop: true, align: "start" }}
        className="relative"
      >
        <CarouselContent className="m-0">
          {slides.map((slide, idx) => (
            <CarouselItem key={idx} className="p-0">
              <HeroSlide slide={slide} index={idx} />
            </CarouselItem>
          ))}
        </CarouselContent>

        <CarouselPrevious className="left-2 top-1/2 hidden -translate-y-1/2 sm:left-6 sm:flex" />
        <CarouselNext className="right-2 top-1/2 hidden -translate-y-1/2 sm:right-6 sm:flex" />

        <div className="absolute bottom-4 left-1/2 z-20 -translate-x-1/2">
          <div className="flex items-center gap-1.5 rounded-full bg-black/10 px-2.5 py-1.5">
            {slides.map((_, i) => (
              <button
                key={i}
                type="button"
                aria-label={`Go to slide ${i + 1}`}
                onClick={() => api?.scrollTo(i)}
                className={cn(
                  "h-1.5 w-1.5 rounded-full transition",
                  i === active
                    ? "bg-white/90"
                    : "bg-white/35 hover:bg-white/55",
                )}
              />
            ))}
          </div>
        </div>
      </Carousel>
    </div>
  );
}
