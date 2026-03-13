"use client";

import { useEffect } from "react";

import HeroCarouselClient from "./HeroCarouselClient";
import type { Slide } from "./types";

export const HERO_SECTION_ID = "hero-section-root";

export default function HeroCarouselHydration({ slides }: { slides: Slide[] }) {
  useEffect(() => {
    const el = document.getElementById(HERO_SECTION_ID);
    if (el) el.setAttribute("data-hydrated", "true");
  }, []);

  return <HeroCarouselClient slides={slides} />;
}
