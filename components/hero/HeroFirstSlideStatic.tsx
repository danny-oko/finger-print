import Image from "next/image";
import Link from "next/link";

import { getTranslation, type Lang } from "@/lib/translations";
import { cn } from "@/lib/utils";

import type { Slide } from "./types";
import { CONTAINER } from "./types";

export default function HeroFirstSlideStatic({
  firstSlide,
  lang,
}: {
  firstSlide: Slide;
  lang: Lang;
}) {
  const t = (key: string) => getTranslation(lang, key);

  return (
    <div
      className={cn(
        "relative isolate overflow-hidden sm:rounded-none",
        "h-[90vh] min-h-[400px] w-full sm:min-h-[500px] md:min-h-[560px]",
      )}
    >
      {/* Media */}
      {firstSlide.type === "video" ? (
        <video
          className="absolute inset-0 h-full w-full object-cover"
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          poster={firstSlide.poster}
        >
          <source src={firstSlide.src} type="video/mp4" />
        </video>
      ) : (
        <div className="absolute inset-0">
          <Image
            src={firstSlide.src}
            alt={firstSlide.alt}
            fill
            priority
            className="object-cover"
          />
        </div>
      )}

      {/* Overlay */}
      <div className="absolute inset-0 bg-black/52" />

      {/* Content */}
      <div className="relative z-10 flex h-full items-end">
        <div className={cn(CONTAINER, "h-full w-full")}>
          <div
            className="flex h-full items-end"
            style={{
              paddingTop:
                "calc(var(--nav-h, 80px) + var(--nav-gap, 24px) + 12px)",
            }}
          >
            <div className="w-full pb-14 md:pb-16">
              <div className="w-full pt-6">
                <div className="inline-flex items-center rounded-full bg-white/10 px-4 py-2 text-xs font-medium text-white ring-1 ring-white/15">
                  {t("hero.badge")}
                </div>
                <h1 className="mt-5 text-4xl font-semibold leading-[1.02] tracking-tight text-white sm:text-5xl md:text-7xl">
                  {t("hero.title")}
                </h1>
                <p className="mt-3 text-base text-white/85 md:text-lg">
                  {t("hero.subtitle")}
                </p>
                <p className="mt-4 max-w-[58ch] text-sm text-white/75 md:text-base">
                  {t("hero.description")}
                </p>
                <div className="mt-8 flex flex-wrap items-center gap-4">
                  <Link
                    href="#stories"
                    className="inline-flex h-11 items-center justify-center gap-3 rounded-full bg-white px-8 font-medium text-black transition hover:bg-black hover:text-white"
                  >
                    {t("hero.ctaPrimary")}
                  </Link>
                  <Link
                    href="#about"
                    className="inline-flex h-11 items-center justify-center rounded-full border border-white/40 bg-white/10 px-8 font-medium text-white backdrop-blur transition hover:bg-white/20"
                  >
                    {t("hero.ctaSecondary")}
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
