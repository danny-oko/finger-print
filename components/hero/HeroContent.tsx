"use client";

import { Play, Volume2, VolumeX } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { useTranslation } from "@/lib/useTranslation";
import HeroVideoDialog from "./HeroVideoDialog";
import { YT_EMBED } from "./types";

export default function HeroContent({
  muted,
  onToggleMute,
}: {
  muted: boolean;
  onToggleMute: () => void;
}) {
  const [open, setOpen] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <>
      <div className="w-full pt-6">
        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex items-center rounded-full bg-white/10 px-4 py-2 text-xs font-medium text-white ring-1 ring-white/15">
            {t("hero.badge")}
          </div>

          <Link
            href="/event/registration"
            className="group inline-flex items-center gap-2 rounded-full bg-[#F98C01]/15 px-4 py-2 text-xs font-semibold text-[#F98C01] ring-1 ring-[#F98C01]/40 transition hover:bg-[#F98C01]/25"
          >
            <span className="relative flex size-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#F98C01] opacity-75" />
              <span className="relative inline-flex size-1.5 rounded-full bg-[#F98C01]" />
            </span>
            {t("register.badge")}
            <span className="transition-transform group-hover:translate-x-0.5">→</span>
          </Link>
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
          <Button className="h-11 rounded-full px-8 cursor-pointer text-black" asChild>
            <Link href="/event/registration">{t("register.button")}</Link>
          </Button>

          <Button
            variant="secondary"
            className="h-11 gap-3 rounded-full px-8 cursor-pointer"
            onClick={() => setOpen(true)}
          >
            <Play className="h-4 w-4 fill-transparent stroke-[2.2]" />
            {t("hero.ctaPrimary")}
          </Button>

          <Button
            variant="secondary"
            className="h-11 rounded-full px-8 cursor-pointer"
            asChild
          >
            <Link href="#about">{t("hero.ctaSecondary")}</Link>
          </Button>

          <button
            type="button"
            onClick={onToggleMute}
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/40 bg-black/30 text-white/90 backdrop-blur transition hover:bg-black/60"
            aria-label={
              muted ? "Unmute background video" : "Mute background video"
            }
          >
            {muted ? (
              <VolumeX className="h-5 w-5" />
            ) : (
              <Volume2 className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>

      <HeroVideoDialog open={open} onOpenChange={setOpen} src={YT_EMBED} />
    </>
  );
}
