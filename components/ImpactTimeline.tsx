// app/components/ImpactTimeline.tsx
"use client";

import * as React from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { cn } from "@/lib/utils";

type TimelineItem = {
  year: string;
  title: string;
  summary: string;
  pills?: string[];
};

const CONTAINER = "mx-auto w-[min(80vw,1200px)]";

export default function ImpactTimeline({
  className,
  label = "Impact",
  heading = "Impact Timeline",
  subheading = "Five editions since 2017, building unity and strengthening youth ministry across Evangelical churches.",
  items = [
    {
      year: "2017",
      title: "1st Edition",
      summary:
        "The beginning of a shared youth ministry network across Evangelical churches.",
      pills: ["Attendees: TBA", "Churches: TBA", "Location: Ulaanbaatar"],
    },
    {
      year: "2018",
      title: "2nd Edition",
      summary:
        "A clearer focus on identity in Christ through worship, teaching, and community.",
      pills: ["Attendees: TBA", "Churches: TBA", "Theme: TBA"],
    },
    {
      year: "2019",
      title: "3rd Edition",
      summary:
        "Stronger collaboration between youth leaders and ministries, with deeper unity.",
      pills: ["Attendees: TBA", "Churches: TBA", "Volunteers: TBA"],
    },
    {
      year: "2020–2021",
      title: "4th Edition",
      summary:
        "Sustaining the movement through challenges while keeping teens connected to faith.",
      pills: ["Format: TBA", "Reach: TBA", "Theme: TBA"],
    },
    {
      year: "2023–2024",
      title: "5th Edition",
      summary:
        "Serving the next generation with renewed vision and wider cooperation.",
      pills: ["Attendees: TBA", "Churches: TBA", "Location: TBA"],
    },
  ] as TimelineItem[],
}: {
  className?: string;
  label?: string;
  heading?: string;
  subheading?: string;
  items?: TimelineItem[];
}) {
  const sectionRef = React.useRef<HTMLElement | null>(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start 0.85", "end 0.2"],
  });

  const lineScaleY = useTransform(scrollYProgress, [0, 1], [0, 1]);

  return (
    <section ref={sectionRef} className={cn("w-full bg-white", className)}>
      <div className={cn(CONTAINER, "py-20 md:py-28")}>
        <div className="grid gap-10 md:grid-cols-[320px_1fr] md:gap-14">
          <div className="md:sticky md:top-24 md:self-start">
            <div className="inline-flex items-center gap-2 rounded-full border border-neutral-900/15 bg-neutral-900/5 px-4 py-2 text-xs font-medium text-neutral-900/70">
              {label}
            </div>

            <h2 className="mt-6 text-3xl font-semibold tracking-tight text-neutral-900 md:text-4xl">
              {heading}
            </h2>

            <p className="mt-4 max-w-[40ch] text-base leading-relaxed text-neutral-900/70">
              {subheading}
            </p>
          </div>

          <div className="relative">
            <div className="pointer-events-none absolute left-[14px] top-0 h-full w-[2px] bg-neutral-900/10" />
            <motion.div
              className="pointer-events-none absolute left-[14px] top-0 h-full w-[2px] origin-top bg-neutral-900/70"
              style={{ scaleY: lineScaleY }}
            />

            <div className="space-y-7">
              {items.map((it, idx) => (
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
      className="relative pl-12"
    >
      <div className="absolute left-[7px] top-7 h-4 w-4 rounded-full bg-white ring-2 ring-neutral-900/70" />

      <div className="rounded-3xl border border-neutral-900/10 bg-white p-6 shadow-[0_18px_40px_rgba(0,0,0,.06)]">
        <div className="flex flex-wrap items-baseline gap-x-4 gap-y-2">
          <div className="text-2xl font-semibold tracking-tight text-neutral-900">
            {item.year}
          </div>
          <div className="text-sm font-medium text-neutral-900/60">
            {item.title}
          </div>
        </div>

        <p className="mt-3 text-base leading-relaxed text-neutral-900/75">
          {item.summary}
        </p>

        {item.pills?.length ? (
          <div className="mt-5 flex flex-wrap gap-2">
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
    </motion.div>
  );
}
