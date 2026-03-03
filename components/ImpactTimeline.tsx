"use client";

import * as React from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { cn } from "@/lib/utils";
import ImageTrail from "./ImageTrail";
import ShinyText from "./ShinyText";
import RotatingText from "./RotatingText";
import { useTranslation } from "@/lib/useTranslation";
import { getTranslations } from "@/lib/translations";
import { Badge } from "./ui/badge";

type TimelineItem = {
  year: string;
  title: string;
  summary: string;
  pills?: string[];
  images?: string[];
};

const CONTAINER = "mx-auto w-full max-w-[1200px] px-4 sm:px-6";

export default function ImpactTimeline({
  className,
  label = "Impact",
  heading = "Impact Timeline",
  subheading = "Five editions since 2017, building unity and strengthening youth ministry across Evangelical churches.",
  hoverHint = "Hover over each year to reveal images.",
  mobileHint = "Swipe images on each year card.",
  items = [
    {
      year: "2017",
      title: "1st Edition",
      summary:
        "The beginning of a shared youth ministry network across Evangelical churches.",
      pills: ["Attendees: TBA", "Churches: TBA", "Location: Ulaanbaatar"],
      images: ["/fp-1.jpg", "/fp-2.jpg", "/fp-3.jpg", "/fp-4.jpg"],
    },
    {
      year: "2018",
      title: "2nd Edition",
      summary:
        "A clearer focus on identity in Christ through worship, teaching, and community.",
      pills: ["Attendees: TBA", "Churches: TBA", "Theme: TBA"],
      images: ["/fp-1.jpg", "/fp-2.jpg", "/fp-3.jpg", "/fp-4.jpg"],
    },
    {
      year: "2019",
      title: "3rd Edition",
      summary:
        "Stronger collaboration between youth leaders and ministries, with deeper unity.",
      pills: ["Attendees: TBA", "Churches: TBA", "Volunteers: TBA"],
      images: ["/fp-1.jpg", "/fp-2.jpg", "/fp-3.jpg", "/fp-4.jpg"],
    },
    {
      year: "2020–2021",
      title: "4th Edition",
      summary:
        "Sustaining the movement through challenges while keeping teens connected to faith.",
      pills: ["Format: TBA", "Reach: TBA", "Theme: TBA"],
      images: ["/fp-4.jpg", "/fp-5.jpg", "/fp-6.jpg", "/fp-7.jpg"],
    },
    {
      year: "2023–2024",
      title: "5th Edition",
      summary:
        "Serving the next generation with renewed vision and wider cooperation.",
      pills: ["Attendees: TBA", "Churches: TBA", "Location: TBA"],
      images: ["/fp-4.jpg", "/fp-5.jpg", "/fp-6.jpg", "/fp-7.jpg"],
    },
  ] as TimelineItem[],
}: {
  className?: string;
  label?: string;
  heading?: string;
  subheading?: string;
  hoverHint?: string;
  mobileHint?: string;
  items?: TimelineItem[];
}) {
  const sectionRef = React.useRef<HTMLElement | null>(null);
  const { lang, t } = useTranslation();
  const tr = getTranslations(lang);

  const defaultItems: TimelineItem[] = [
    {
      year: "2017",
      title: tr.journey.title1,
      summary: tr.journey.summary1,
      pills: [
        tr.journey.pillsAttendees,
        tr.journey.pillsChurches,
        tr.journey.pillsLocation,
      ],
      images: ["/fp-1.jpg", "/fp-2.jpg", "/fp-3.jpg", "/fp-4.jpg"],
    },
    {
      year: "2018",
      title: tr.journey.title2,
      summary: tr.journey.summary2,
      pills: [
        tr.journey.pillsAttendees,
        tr.journey.pillsChurches,
        tr.journey.pillsTheme,
      ],
      images: ["/fp-1.jpg", "/fp-2.jpg", "/fp-3.jpg", "/fp-4.jpg"],
    },
    {
      year: "2019",
      title: tr.journey.title3,
      summary: tr.journey.summary3,
      pills: [
        tr.journey.pillsAttendees,
        tr.journey.pillsChurches,
        tr.journey.pillsVolunteers,
      ],
      images: ["/fp-1.jpg", "/fp-2.jpg", "/fp-3.jpg", "/fp-4.jpg"],
    },
    {
      year: "2020–2021",
      title: tr.journey.title4,
      summary: tr.journey.summary4,
      pills: [
        tr.journey.pillsFormat,
        tr.journey.pillsReach,
        tr.journey.pillsTheme,
      ],
      images: ["/fp-4.jpg", "/fp-5.jpg", "/fp-6.jpg", "/fp-7.jpg"],
    },
    {
      year: "2023–2024",
      title: tr.journey.title5,
      summary: tr.journey.summary5,
      pills: [
        tr.journey.pillsAttendees,
        tr.journey.pillsChurches,
        tr.journey.pillsLocation,
      ],
      images: ["/fp-4.jpg", "/fp-5.jpg", "/fp-6.jpg", "/fp-7.jpg"],
    },
  ];

  const displayItems = items ?? defaultItems;

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start 0.85", "end 0.2"],
  });

  const lineScaleY = useTransform(scrollYProgress, [0, 1], [0, 1]);

  return (
    <section
      ref={sectionRef}
      className={cn(
        "relative w-full min-w-0 overflow-x-hidden bg-white",
        className,
      )}
    >
      <div className={cn(CONTAINER, "py-20 md:py-28")}>
        <div className="grid min-w-0 grid-cols-1 gap-10 md:grid-cols-[320px_1fr] md:gap-14">
          <div className="md:sticky md:top-24 md:self-start">
            {/* <Badge className="rounded-full bg-[#F98C01] px-5 py-1.5 text-sm text-black tracking-tight shadow-[0_0_50px_rgba(249,140,1,0.35)] ">
              {t("journey.label")}
            </Badge> */}
            {/* <div className="inline-flex items-center gap-2 rounded-full border border-neutral-900/15 bg-neutral-900/5 px-4 py-2 text-xs font-medium text-neutral-900/70"></div> */}

            <h2 className="mt-6 text-3xl font-semibold tracking-tight text-neutral-900 md:text-3xl flex-wrap">
              <span className="block">
                {t("journey.theJourney")} {t("journey.since")}
              </span>

              <span className="mt-2 flex items-center gap-2">
                <RotatingText
                  texts={tr.journey.rotating}
                  mainClassName={[
                    "relative inline-flex items-center justify-center",
                    "whitespace-nowrap",
                    "min-w-max",
                    "rounded-2xl px-4 sm:px-5 md:px-6",
                    "py-1.5 sm:py-2",
                    "text-black",
                    "bg-[linear-gradient(180deg,#FFC36A_0%,#F98C01_100%)]",
                    "shadow-[0_18px_36px_rgba(0,0,0,.16)]",
                    "ring-1 ring-black/5",
                    "overflow-hidden",
                  ].join(" ")}
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
              <p className="hidden text-sm text-neutral-900/55 md:block">
                <ShinyText
                  text={t("journey.hoverHint")}
                  speed={2}
                  delay={0}
                  color="#737373"
                  shineColor="#111111"
                  spread={90}
                  direction="left"
                  yoyo={false}
                  pauseOnHover={false}
                  disabled={false}
                />
              </p>
              <p className="text-sm text-neutral-900/55 md:hidden">
                {t("journey.mobileHint")}
              </p>
            </div>
          </div>

          <div className="relative min-w-0">
            <div className="pointer-events-none absolute left-[14px] top-0 hidden h-full w-[2px] bg-neutral-900/10 md:block" />
            <motion.div
              className="pointer-events-none absolute left-[14px] top-0 hidden h-full w-[2px] origin-top bg-neutral-900/70 md:block"
              style={{ scaleY: lineScaleY }}
            />

            <div className="min-w-0 space-y-7">
              {displayItems.map((it, idx) => (
                <TimelineRow key={`${it.year}-${idx}`} item={it} index={idx} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function TimelineRow({ item, index }: { item: TimelineItem; index: number }) {
  const [trailKey, setTrailKey] = React.useState(0);
  const images = React.useMemo(() => item.images ?? [], [item.images]);

  const bumpTrail = () => setTrailKey((k) => k + 1);

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -10% 0px" }}
      transition={{
        duration: 0.5,
        ease: [0.2, 0.8, 0.2, 1],
        delay: Math.min(0.12, index * 0.03),
      }}
      className="relative min-w-0 pl-0 md:pl-12"
      onMouseEnter={bumpTrail}
      onFocus={bumpTrail}
      tabIndex={0}
    >
      <div className="absolute left-[7px] top-7 hidden h-4 w-4 rounded-full bg-white ring-2 ring-neutral-900/70 md:block" />

      <div className="relative max-w-full overflow-hidden rounded-3xl border border-neutral-900/10 bg-white shadow-[0_18px_40px_rgba(0,0,0,.06)]">
        <div className="relative w-full min-w-0">
          <div className="hidden md:block">
            <div className="relative h-[180px] w-full">
              <div className="absolute inset-0">
                <ImageTrail key={trailKey} items={images} variant={1} />
              </div>
              <div className="absolute inset-0 bg-gradient-to-b from-white/0 via-white/10 to-white/90" />
            </div>
          </div>

          <div className="max-w-full overflow-x-auto overscroll-x-contain md:hidden">
            <div className="flex touch-pan-x gap-3 px-4 pt-4 pb-3 sm:px-5 sm:pb-4 snap-x snap-mandatory">
              {images.slice(0, 10).map((src) => (
                <img
                  key={src}
                  src={src}
                  alt=""
                  className="h-24 w-24 flex-none shrink-0 snap-center rounded-2xl object-cover sm:h-28 sm:w-28"
                  loading="lazy"
                  draggable={false}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="relative min-w-0 overflow-hidden p-5 sm:p-6">
          <div className="flex flex-wrap items-baseline gap-x-4 gap-y-2">
            <div className="text-2xl font-semibold tracking-tight text-neutral-900">
              {item.year}
            </div>
            <div className="text-sm font-medium text-neutral-900/60">
              {item.title}
            </div>
          </div>

          <p className="mt-3 text-base leading-relaxed text-neutral-900/75 break-words">
            {item.summary}
          </p>

          {item.pills?.length ? (
            <div className="mt-5 flex flex-wrap gap-2 break-words">
              {item.pills.map((p) => (
                <span
                  key={p}
                  className="inline-flex items-center rounded-full border border-neutral-900/10 bg-neutral-900/5 px-3 py-1 text-xs font-medium text-neutral-900/70"
                >
                  {p}
                </span>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </motion.div>
  );
}
