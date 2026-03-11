import { getTranslations } from "@/lib/translations";
import { useTranslation } from "@/lib/useTranslation";
import RotatingText from "@/components/RotatingText";
import ShinyText from "@/components/ShinyText";

export default function JourneyHeader() {
  const { lang, t } = useTranslation();
  const tr = getTranslations(lang);

  return (
    <div className="md:sticky md:top-24 md:self-start">
      <h2 className="mt-6 text-3xl font-semibold tracking-tight text-neutral-900 md:text-3xl flex-wrap">
        <span className="block">
          {t("journey.theJourney")} {t("journey.since")}
        </span>

        <span className="mt-2 flex items-center gap-2">
          <RotatingText
            texts={tr.journey.rotating}
            mainClassName="relative inline-flex items-center justify-center whitespace-nowrap min-w-max rounded-2xl px-4 sm:px-5 md:px-6 py-1.5 sm:py-2 text-black bg-[linear-gradient(180deg,#FFC36A_0%,#F98C01_100%)] shadow-[0_18px_36px_rgba(0,0,0,.16)] ring-1 ring-black/5 overflow-hidden"
            splitLevelClassName="overflow-hidden"
            elementLevelClassName="inline-block whitespace-nowrap"
            staggerFrom="last"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "-120%" }}
            staggerDuration={0.025}
            transition={{ type: "spring", damping: 30, stiffness: 400 }}
            rotationInterval={2800}
            animatePresenceMode="wait"
          />
        </span>
      </h2>

      <p className="mt-4 max-w-[40ch] text-base leading-relaxed text-neutral-900/70">
        {t("journey.subheading")}
      </p>

      <div className="mt-6">
        <p className="hidden text-sm text-neutral-900/55 md:block sm:hidden">
          <ShinyText
            text={t("journey.hoverHint")}
            speed={2}
            color="#737373"
            shineColor="#111111"
            spread={90}
            direction="left"
          />
        </p>

        <p className="text-sm text-neutral-900/55 md:hidden">
          {t("journey.mobileHint")}
        </p>
      </div>
    </div>
  );
}
