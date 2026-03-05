"use client";

import { cn } from "@/lib/utils";
import * as React from "react";
import CountDownHeader from "./CountDownHeader";
import CountDownUnit from "./CountDownUnit";
import { TARGET_ISO, getTimeLeft, pad2, type TimeLeft } from "./utils";

const CONTAINER = "mx-auto w-[min(calc(100%-2rem),80vw,1200px)]";

function useIsMdUp() {
  const [mdUp, setMdUp] = React.useState(false);

  React.useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const onChange = () => setMdUp(mq.matches);
    onChange();
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  return mdUp;
}

export default function CountDown() {
  const mdUp = useIsMdUp();

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

  const fullDays = mounted ? String(time.days) : "0";
  const mobileDays2 = mounted ? pad2(time.days % 100) : "00"; // ✅ no 3-digit stack on mobile

  const hours = mounted ? pad2(time.hours) : "00";
  const minutes = mounted ? pad2(time.minutes) : "00";
  const seconds = mounted ? pad2(time.seconds) : "00";

  return (
    <section className="w-full bg-white">
      <div className={cn(CONTAINER, "py-16 sm:py-20")}>
        <div className="rounded-3xl bg-black px-4 py-10 sm:px-12 sm:py-16 shadow-[0_30px_90px_rgba(0,0,0,0.18)]">
          <CountDownHeader />

          <div
            className={cn(
              "mx-auto mt-10 w-full w-full",
              "grid grid-cols-2 gap-x-6 gap-y-10",
              "md:max-w-none md:grid-cols-4 md:gap-x-8 md:gap-y-0",
              "items-end justify-items-center",
            )}
          >
            <CountDownUnit
              label="Days"
              value={mdUp ? fullDays : mobileDays2}
              minDigits={mdUp ? 3 : 2}
            />
            <CountDownUnit label="Hours" value={hours} minDigits={2} />
            <CountDownUnit label="Minutes" value={minutes} minDigits={2} />
            <CountDownUnit label="Seconds" value={seconds} minDigits={2} />
          </div>
        </div>
      </div>
    </section>
  );
}
