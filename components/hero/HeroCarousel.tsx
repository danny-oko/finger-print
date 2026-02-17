// app/components/hero/HeroCarousel.tsx
"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import {
  Carousel,
  CarouselApi,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

import HeroSlide from "./HeroSlide";
import { Slide } from "./types";

export default function HeroCarousel({
  slides,
  className,
}: {
  slides: Slide[];
  className?: string;
}) {
  const [api, setApi] = React.useState<CarouselApi | null>(null);

  React.useEffect(() => {
    if (!api || slides.length <= 1) return;

    const id = window.setInterval(() => {
      api.scrollNext();
    }, 6000);

    return () => window.clearInterval(id);
  }, [api, slides.length]);

  return (
    <section className={cn("w-full", className)}>
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

        <CarouselPrevious className="left-6 top-1/2 -translate-y-1/2" />
        <CarouselNext className="right-6 top-1/2 -translate-y-1/2" />
      </Carousel>
    </section>
  );
}
