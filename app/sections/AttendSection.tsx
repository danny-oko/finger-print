"use client";

import ShinyText from "@/components/ShinyText";
import SpotlightCard from "@/components/SpotlightCard";
import { useTranslation } from "@/lib/useTranslation";

export default function AttendSection() {
  const { t } = useTranslation();

  return (
    <section id="attend" className="w-full py-24">
      <div className="mx-auto w-[min(calc(100%-2rem),80vw,1200px)]">
        {/* Header */}
        <div className="mb-16 text-center">
          <h2 className="text-3xl font-black text-black sm:text-4xl">
            {t("attend.heading")}
          </h2>

          <div className="mt-4">
            <ShinyText
              text={t("attend.subtitle")}
              speed={2}
              delay={0}
              color="#737373"
              shineColor="#111111"
              spread={120}
              direction="left"
              yoyo={false}
              pauseOnHover={false}
              disabled={false}
            />
          </div>
        </div>

        {/* Cards */}
        <div className="grid gap-8 md:grid-cols-3">
          {/* Card 1 */}
          <SpotlightCard
            className="custom-spotlight-card rounded-2xl border border-white/10 p-8"
            spotlightColor="rgba(249, 140, 1, 0.25)"
          >
            <h3 className="mb-4 text-xl font-bold text-white">
              {t("attend.attendTitle")}
            </h3>

            <p className="text-neutral-400 leading-relaxed">
              {t("attend.attendDescription")}
            </p>
          </SpotlightCard>

          {/* Card 2 */}
          <SpotlightCard
            className="custom-spotlight-card rounded-2xl border border-white/10 p-8"
            spotlightColor="rgba(249, 140, 1, 0.25)"
          >
            <h3 className="mb-4 text-xl font-bold text-white">
              {t("attend.serveTitle")}
            </h3>

            <p className="text-neutral-400 leading-relaxed">
              {t("attend.serveDescription")}
            </p>
          </SpotlightCard>

          {/* Card 3 */}
          <SpotlightCard
            className="custom-spotlight-card rounded-2xl border border-white/10 p-8"
            spotlightColor="rgba(249, 140, 1, 0.25)"
          >
            <h3 className="mb-4 text-xl font-bold text-white">
              {t("attend.supportTitle")}
            </h3>

            <p className="text-neutral-400 leading-relaxed">
              {t("attend.supportDescription")}
            </p>
          </SpotlightCard>
        </div>
      </div>
    </section>
  );
}
