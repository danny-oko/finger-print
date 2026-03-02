"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import CountDownHeader from "./CountDownHeader";
import CountDownUnit from "./CountDownUnit";
import { TARGET_ISO, getTimeLeft, pad2, type TimeLeft } from "./utils";

const CONTAINER = "mx-auto w-[min(calc(100%-2rem),80vw,1200px)]";

export default function CountDown() {
  const [mounted, setMounted] = React.useState(false);
  const [time, setTime] = React.useState<TimeLeft>({
    totalMs: 0,
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  React.useEffect(() => {
    setMounted(true);

    const target = new Date(TARGET_ISO);
    const tick = () => setTime(getTimeLeft(target));
    tick();

    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, []);

  const days = mounted ? String(time.days) : "0";
  const hours = mounted ? pad2(time.hours) : "00";
  const minutes = mounted ? pad2(time.minutes) : "00";
  const seconds = mounted ? pad2(time.seconds) : "00";

  return (
    <section className="w-full bg-white">
      <div className={cn(CONTAINER, "py-16 sm:py-20")}>
        <div className="rounded-3xl bg-black px-6 py-12 sm:px-12 sm:py-16 shadow-[0_30px_90px_rgba(0,0,0,0.18)]">
          <CountDownHeader />

          <div className="flex items-end justify-center gap-8 flex-nowrap overflow-x-auto">
            <CountDownUnit label="Days" value={days} minDigits={3} />
            <CountDownUnit label="Hours" value={hours} minDigits={2} />
            <CountDownUnit label="Minutes" value={minutes} minDigits={2} />
            <CountDownUnit label="Seconds" value={seconds} minDigits={2} />
          </div>
        </div>
      </div>
    </section>
  );
}
