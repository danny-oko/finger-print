// app/components/HeroCarousel.tsx
"use client";

import Image from "next/image";
import Link from "next/link";
import * as React from "react";
import { Play } from "lucide-react";

import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { DialogTitle } from "@/components/ui/dialog";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import { Dialog, DialogContent } from "@/components/ui/dialog";

type Slide =
  | { type: "video"; src: string; poster?: string }
  | { type: "image"; src: string; alt: string };

const YT_EMBED =
  "https://www.youtube.com/embed/g5Uk9WVFTt0?autoplay=1&rel=0&modestbranding=1";

const heroCopy = {
  badge: "Since 2017 • 5 editions",
  title: "Finger Print",
  subtitle: "Teen Seminar for Mongolian Churches",
  description:
    "Supporting and connecting youth ministries across Mongolia’s Evangelical churches—helping every teen discover their unique, God-given identity.",
  ctaPrimary: "Watch Full Video",
  ctaSecondary: "Get In Touch",
};

export default function HeroCarousel({
  slides,
  className,
}: {
  slides: Slide[];
  className?: string;
}) {
  return (
    <section className={cn("w-full", className)}>
      <Carousel opts={{ loop: true, align: "start" }} className="relative">
        <CarouselContent className="m-0">
          {slides.map((s, idx) => (
            <CarouselItem key={idx} className="p-0">
              <div
                className={cn(
                  "relative isolate overflow-hidden rounded-3xl",
                  "h-[90vh] min-h-[560px] w-full",
                )}
              >
                {/* Background media */}
                {s.type === "video" ? (
                  <video
                    className="absolute inset-0 h-full w-full object-cover"
                    autoPlay
                    muted
                    loop
                    playsInline
                    preload="metadata"
                    poster={s.poster}
                  >
                    <source src={s.src} type="video/mp4" />
                  </video>
                ) : (
                  <Image
                    src={s.src}
                    alt={s.alt}
                    fill
                    priority={idx === 0}
                    className="object-cover"
                  />
                )}

                {/* overlay (tweak transparency here) */}
                <div className="absolute inset-0 bg-black/25" />

                {/* Content pinned bottom-left */}
                <div className="relative z-10 h-full">
                  <div className="mx-auto h-full w-[min(1120px,92vw)]">
                    <div
                      className="flex h-full items-end"
                      style={{
                        paddingTop:
                          "calc(var(--nav-h, 80px) + var(--nav-gap, 24px) + 12px)",
                      }}
                    >
                      <div className="pb-14 md:pb-16 w-full">
                        {idx === 0 ? (
                          <HeroContent />
                        ) : (
                          <ImageSlideCaption index={idx} />
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>

        {/* Controls */}
        <CarouselPrevious className="left-6 top-1/2 -translate-y-1/2" />
        <CarouselNext className="right-6 top-1/2 -translate-y-1/2" />
      </Carousel>
    </section>
  );
}

function HeroContent() {
  const [open, setOpen] = React.useState(false);

  return (
    <>
      <div className="max-w-[640px]">
        <div className="inline-flex items-center rounded-full bg-white/10 px-4 py-2 text-xs font-medium text-white ring-1 ring-white/15">
          {heroCopy.badge}
        </div>

        <h1 className="mt-5 text-5xl md:text-7xl font-semibold leading-[1.02] tracking-tight text-white">
          {heroCopy.title}
        </h1>

        <p className="mt-3 text-base md:text-lg text-white/85">
          {heroCopy.subtitle}
        </p>

        <p className="mt-4 text-sm md:text-base text-white/75 max-w-[58ch]">
          {heroCopy.description}
        </p>

        <div className="mt-8 flex flex-wrap gap-4">
          <Button
            className="h-11 rounded-full px-8 gap-3"
            onClick={() => setOpen(true)}
          >
            <Play className="h-4 w-4 text-white fill-transparent stroke-[2.2]" />
            {heroCopy.ctaPrimary}
          </Button>

          <Button
            variant="secondary"
            className="h-11 rounded-full px-8"
            asChild
          >
            <Link href="#about">{heroCopy.ctaSecondary}</Link>
          </Button>
        </div>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          className="
      fixed inset-0 z-[999]
      !top-0 !left-0
      !translate-x-0 !translate-y-0
      w-screen h-screen
      max-w-none
      p-0
      border-0
      bg-transparent
      shadow-none
      rounded-none

      !grid
      place-items-center
    "
        >
          <VisuallyHidden>
            <DialogTitle>Finger Print Full Video</DialogTitle>
          </VisuallyHidden>

          <div className="w-[min(92vw,1100px)] aspect-video bg-black overflow-hidden">
            <iframe
              key={open ? "open" : "closed"}
              className="h-full w-full"
              src="https://www.youtube.com/embed/g5Uk9WVFTt0?autoplay=1&rel=0&modestbranding=1"
              title="YouTube video"
              allow="autoplay; encrypted-media; picture-in-picture"
              allowFullScreen
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

function ImageSlideCaption({ index }: { index: number }) {
  return (
    <div className="max-w-[520px] text-white">
      <div className="inline-flex items-center rounded-full bg-white/10 px-4 py-2 text-xs font-medium ring-1 ring-white/15">
        Gallery • Slide {index + 1}
      </div>

      <h2 className="mt-4 text-3xl md:text-4xl font-semibold leading-tight">
        A space for worship, growth, and community.
      </h2>

      <p className="mt-3 text-sm md:text-base text-white/75 max-w-[58ch]">
        Add your own caption per slide if you want (schedule highlight, theme,
        speakers, testimonies, etc).
      </p>
    </div>
  );
}
