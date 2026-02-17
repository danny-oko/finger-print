"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Play } from "lucide-react";

import { Button } from "@/components/ui/button";
import HeroVideoDialog from "./HeroVideoDialog";
import { heroCopy, YT_EMBED } from "./types";

import Counter from "@/components/Counter";

export default function HeroContent() {
  const [open, setOpen] = useState(false);

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
        <div className="inline-flex items-center rounded-full bg-white/10 px-4 py-2 text-xs font-medium text-white ring-1 ring-white/15"></div>

        <h1 className="mt-5 text-5xl font-semibold leading-[1.02] tracking-tight text-white md:text-7xl">
          {heroCopy.title}
        </h1>

        <p className="mt-3 text-base text-white/85 md:text-lg">
          {heroCopy.subtitle}
        </p>

        <p className="mt-4 max-w-[58ch] text-sm text-white/75 md:text-base">
          {heroCopy.description}
        </p>

        <div className="mt-8 flex flex-wrap gap-4">
          <Button
            className="h-11 gap-3 rounded-full px-8"
            onClick={() => setOpen(true)}
          >
            <Play className="h-4 w-4 fill-transparent stroke-[2.2] text-white" />
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

      <HeroVideoDialog open={open} onOpenChange={setOpen} src={YT_EMBED} />
    </>
  );
}
