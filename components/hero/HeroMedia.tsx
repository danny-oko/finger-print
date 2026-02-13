"use client";

import Image from "next/image";
import { Slide } from "./types";

export default function HeroMedia({
  slide,
  priority,
}: {
  slide: Slide;
  priority?: boolean;
}) {
  if (slide.type === "video") {
    return (
      <video
        className="absolute inset-0 h-full w-full object-cover"
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        poster={slide.poster}
      >
        <source src={slide.src} type="video/mp4" />
      </video>
    );
  }

  return (
    <Image
      src={slide.src}
      alt={slide.alt}
      fill
      priority={priority}
      className="object-cover"
    />
  );
}
