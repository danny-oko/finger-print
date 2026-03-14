import { cn } from "@/lib/utils";
import type { Lang } from "@/lib/translations";

import HeroCarouselHydration, {
  HERO_SECTION_ID,
} from "./HeroCarouselHydration";
import HeroFirstSlideStatic from "./HeroFirstSlideStatic";
import type { Slide } from "./types";

export default function HeroCarousel({
  slides,
  lang = "en",
  className,
}: {
  slides: Slide[];
  lang?: Lang;
  className?: string;
}) {
  const firstSlide = slides[0];
  if (!firstSlide) {
    return (
      <section className={cn("w-full", className)}>
        <HeroCarouselHydration slides={slides} />
      </section>
    );
  }

  return (
    <section id={HERO_SECTION_ID} className={cn("relative w-full", className)}>
      <div className="hero-first-static absolute inset-0 z-0">
        <HeroFirstSlideStatic firstSlide={firstSlide} lang={lang} />
      </div>
      <div className="relative z-10">
        <HeroCarouselHydration slides={slides} />
      </div>
    </section>
  );
}
