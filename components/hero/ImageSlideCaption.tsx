"use client";

import { useTranslation } from "@/lib/useTranslation";

export default function ImageSlideCaption({ index }: { index: number }) {
  const { t } = useTranslation();

  if (index === 1) {
    return (
      <div className="max-w-[520px] text-white">
        <div className="inline-flex items-center rounded-full bg-white/10 px-4 py-2 text-xs font-medium ring-1 ring-white/15">
          {t("slides.slide1Badge")}
        </div>

        <h2 className="mt-4 text-3xl font-semibold leading-tight md:text-4xl">
          {t("slides.slide1Title")}
        </h2>

        <p className="mt-3 max-w-[58ch] text-sm text-white/75 md:text-base">
          {t("slides.slide1Desc")}
        </p>
      </div>
    );
  }
  if (index === 2) {
    return (
      <div className="max-w-[520px] text-white">
        <div className="inline-flex items-center rounded-full bg-white/10 px-4 py-2 text-xs font-medium ring-1 ring-white/15">
          {t("slides.slide2Badge")}
        </div>

        <h2 className="mt-4 text-3xl font-semibold leading-tight md:text-4xl">
          {t("slides.slide2Title")}
        </h2>

        <p className="mt-3 max-w-[58ch] text-sm text-white/75 md:text-base">
          {t("slides.slide2Desc")}
        </p>
      </div>
    );
  }

  // if (index === 3) {
  //   return (
  //     <div className="max-w-[520px] text-white">
  //       <div className="inline-flex items-center rounded-full bg-white/10 px-4 py-2 text-xs font-medium ring-1 ring-white/15">
  //         {t("slides.slide3Badge")}
  //       </div>

  //       <h2 className="mt-4 text-3xl font-semibold leading-tight md:text-4xl">
  //         {t("slides.slide3Title")}
  //       </h2>

  //       <p className="mt-3 max-w-[58ch] text-sm text-white/75 md:text-base">
  //         {t("slides.slide3Desc")}
  //       </p>
  //     </div>
  //   );
  // }

  return null;
}
