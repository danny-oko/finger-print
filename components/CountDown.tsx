"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

type Props = {
  className?: string;
  /** Mongolia time by default */
  targetISO?: string; // "2026-10-03T00:00:00+08:00"
  datePillText?: string; // "OCT 03, 2026"
  title?: string; // "FINGER PRINT 2026"
  subtitle?: string; // "IS HAPPENING IN..."
};

type TimeLeft = {
  totalMs: number;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
};

const CONTAINER = "mx-auto w-[min(calc(100%-2rem),80vw,1200px)]";

function getTimeLeft(target: Date): TimeLeft {
  const now = new Date();
  const totalMs = Math.max(0, target.getTime() - now.getTime());
  const totalSeconds = Math.floor(totalMs / 1000);

  const days = Math.floor(totalSeconds / (3600 * 24));
  const hours = Math.floor((totalSeconds % (3600 * 24)) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return { totalMs, days, hours, minutes, seconds };
}

function pad2(n: number) {
  return String(n).padStart(2, "0");
}

export default function FingerprintCountdownV2({
  className,
  targetISO = "2026-10-03T00:00:00+08:00",
  datePillText = "OCT 03, 2026",
  title = "FINGER PRINT 2026",
  subtitle = "IS HAPPENING IN...",
}: Props) {
  const target = React.useMemo(() => new Date(targetISO), [targetISO]);
  const [left, setLeft] = React.useState<TimeLeft>(() => getTimeLeft(target));

  React.useEffect(() => {
    const tick = () => setLeft(getTimeLeft(target));
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [target]);

  // Days can be 3+ digits, keep it as-is
  const days = String(left.days);
  const hours = pad2(left.hours);
  const minutes = pad2(left.minutes);
  const seconds = pad2(left.seconds);

  return (
    <section className={cn("w-full", className)}>
      <div className={CONTAINER}>
        <div
          className={cn(
            "rounded-[28px] bg-white",
            "px-4 py-10 sm:px-8 sm:py-12 md:px-12 md:py-14",
          )}
        >
          <div className="flex justify-center">
            <div
              className={cn(
                "rounded-xl px-5 py-3 text-sm font-extrabold tracking-wide",
                "bg-violet-100 text-violet-700",
              )}
            >
              {datePillText}
            </div>
          </div>

          {/* Title */}
          <div className="mt-6 flex flex-col items-center text-center">
            <h2
              className={cn(
                "font-black tracking-tight text-black",
                "text-[clamp(36px,6vw,92px)] leading-[0.95]",
              )}
            >
              {title}
            </h2>

            <div className="mt-4 text-[clamp(18px,2.2vw,30px)] font-extrabold tracking-tight text-black/90">
              {subtitle}
            </div>

            {/* Timer row */}
            <div
              className={cn(
                "mt-10 w-full",
                "grid gap-y-10",
                "grid-cols-2",
                "md:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr]",
                "items-end justify-items-center",
              )}
            >
              <Metric value={days} label="DAYS" />
              <Colon className="hidden md:block" />

              <Metric value={hours} label="HOURS" />
              <Colon className="hidden md:block" />

              <Metric value={minutes} label="MINUTES" />
              <Colon className="hidden md:block" />

              <Metric value={seconds} label="SECONDS" />
            </div>

            {left.totalMs === 0 && (
              <div className="mt-6 text-sm font-medium text-black/60">
                It’s time.
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function Metric({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <div
        className={cn(
          "font-black leading-none tracking-tight",
          "text-[clamp(56px,8vw,110px)]",
          "bg-gradient-to-r from-violet-500 via-fuchsia-500 to-orange-500",
          "bg-clip-text text-transparent",
        )}
      >
        {value}
      </div>

      <div className="mt-4 text-[clamp(16px,2.2vw,34px)] font-black tracking-tight text-black">
        {label}
      </div>
    </div>
  );
}

function Colon({ className }: { className?: string }) {
  return (
    <div className={cn("pb-7", className)}>
      <div
        className={cn(
          "font-black leading-none text-black/55",
          "text-[clamp(34px,4vw,64px)]",
        )}
      >
        :
      </div>
    </div>
  );
}
