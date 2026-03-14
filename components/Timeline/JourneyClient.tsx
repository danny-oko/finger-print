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
};

const CONTAINER = "mx-auto w-full max-w-[1200px] px-4 sm:px-6";

export default function JourneyClient({ className }: { className?: string }) {
  const sectionRef = React.useRef<HTMLElement | null>(null);

  const { lang, t } = useTranslation();
  const tr = getTranslations(lang);

  const defaultItems: TimelineItem[] = [
    {
      year: "2016",
      title: tr.journey.title1,
      summary: tr.journey.summary1,
      pills: [
        tr.journey.pillsAttendees1,
        tr.journey.pillsServants1 ?? tr.journey.pillsVolunteers1,
      ],
    },
    {
      year: "2017",
      title: tr.journey.title2,
      summary: tr.journey.summary2,
      pills: [
        tr.journey.pillsAttendees2,
        tr.journey.pillsServants2 ?? tr.journey.pillsVolunteers2,
      ],
    },
    {
      year: "2019",
      title: tr.journey.title3,
      summary: tr.journey.summary3,
      pills: [
        tr.journey.pillsAttendees3,
        tr.journey.pillsServants3 ?? tr.journey.pillsVolunteers3,
      ],
    },
    {
      year: "2024",
      title: tr.journey.title4,
      summary: tr.journey.summary4,
      pills: [
        tr.journey.pillsAttendees4,
        tr.journey.pillsServants4 ?? tr.journey.pillsVolunteers4,
      ],
    },
    {
      year: "2025",
      title: tr.journey.title5,
      summary: tr.journey.summary5,
      pills: [
        tr.journey.pillsAttendees5,
        tr.journey.pillsServants5 ?? tr.journey.pillsVolunteers5,
      ],
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
