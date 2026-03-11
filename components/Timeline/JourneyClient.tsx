"use client";

import { getTranslations } from "@/lib/translations";
import { useTranslation } from "@/lib/useTranslation";
import { cn } from "@/lib/utils";
import { useScroll, useTransform } from "framer-motion";
import * as React from "react";

import JourneyHeader from "./JourneyHeader";
import JourneyTimeline from "./JourneyTimeline";

type TimelineItem = {
  year: string;
  title: string;
  summary: string;
  pills?: string[];
  images?: string[];
};

const CONTAINER = "mx-auto w-full max-w-[1200px] px-4 sm:px-6";

export default function JourneyClient({ className }: { className?: string }) {
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
          <JourneyHeader />

          <JourneyTimeline items={defaultItems} lineScaleY={lineScaleY} />
        </div>
      </div>
    </section>
  );
}
