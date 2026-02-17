import { cn } from "@/lib/utils";
import { Slide } from "./types";
import HeroCarouselClient from "./HeroCarouselClient";

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
