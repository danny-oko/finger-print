"use client";

import { motion } from "framer-motion";

export type JourneyCardItem = {
  year: string;
  title: string;
  summary: string;
  pills?: string[];
  images?: string[];
};

export default function JourneyItem({
  item,
  index,
}: {
  item: JourneyCardItem;
  index: number;
}) {
  const images = item.images ?? [];

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
      tabIndex={0}
    >
      <div className="absolute left-[7px] top-7 hidden h-4 w-4 rounded-full bg-white ring-2 ring-neutral-900/70 md:block" />

      <div className="relative max-w-full overflow-hidden rounded-3xl border border-neutral-900/10 bg-white shadow-[0_18px_40px_rgba(0,0,0,.06)]">
        {images.length > 0 ? (
          <div className="max-w-full overflow-x-auto overscroll-x-contain">
            <div className="flex touch-pan-x gap-3 px-4 pt-4 pb-3 sm:px-5 sm:pb-4 md:px-6 snap-x snap-mandatory">
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
        ) : null}

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
