import { motion, type MotionValue } from "framer-motion";
import JourneyItem, { type JourneyCardItem } from "./JourneyItem";

export default function JourneyTimeline({
  items,
  lineScaleY,
}: {
  items: JourneyCardItem[];
  lineScaleY: MotionValue<number>;
}) {
  return (
    <div className="relative min-w-0">
      <div className="pointer-events-none absolute left-[14px] top-0 hidden h-full w-[2px] bg-neutral-900/10 md:block" />

      <motion.div
        className="pointer-events-none absolute left-[14px] top-0 hidden h-full w-[2px] origin-top bg-neutral-900/70 md:block"
        style={{ scaleY: lineScaleY }}
      />

      <div className="min-w-0 space-y-7">
        {items.map((it, idx) => (
          <JourneyItem key={`${it.year}-${idx}`} item={it} index={idx} />
        ))}
      </div>
    </div>
  );
}
