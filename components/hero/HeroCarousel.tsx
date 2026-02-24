import { cn } from "@/lib/utils";
import HeroCarouselClient from "./HeroCarouselClient";
import { Slide } from "./types";

export default function HeroCarousel({
  slides,
  className,
}: {
  slides: Slide[];
  className?: string;
}) {
  return (
    <section className={cn("w-full", className)}>
      <HeroCarouselClient slides={slides} />
    </section>
  );
}
