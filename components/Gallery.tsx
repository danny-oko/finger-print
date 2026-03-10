"use client";

import React from "react";
import DomeGallery from "./DomeGallery";
import { useTranslation } from "@/lib/useTranslation";

const CONTAINER = "mx-auto w-[min(1200px,92vw)]";

const Gallery = () => {
  const { t } = useTranslation();

  return (
    <section className="w-full pt-20 pb-10" id="gallery">
      <div className={CONTAINER}>
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            {t("gallery.title")}
          </h1>
        </div>
      </div>

      <div className="relative mt-10 overflow-visible">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-white to-transparent" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-white to-transparent" />

        <div className="h-[72vh] min-h-[640px] w-screen relative left-1/2 -translate-x-1/2">
          <DomeGallery
            fit={2}
            minRadius={520}
            maxVerticalRotationDeg={0}
            segments={34}
            dragDampening={1}
            grayscale={false}
          />
        </div>
      </div>
    </section>
  );
};

export default Gallery;
