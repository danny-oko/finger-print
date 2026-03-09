"use client";

import { cn } from "@/lib/utils";
import * as React from "react";
import CountDownHeader from "./CountDownHeader";
import CountDownUnit from "./CountDownUnit";
import { TARGET_ISO, getTimeLeft, pad2, type TimeLeft } from "./utils";

const CONTAINER = "mx-auto w-full md:w-[min(calc(100%-2rem),80vw,1200px)]";

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
  const daysMinDigits = Math.max(3, fullDays.length);

  const hours = mounted ? pad2(time.hours) : "00";
  const minutes = mounted ? pad2(time.minutes) : "00";
  const seconds = mounted ? pad2(time.seconds) : "00";

  return (
    <section className="w-full bg-black md:bg-white">
      <div className={cn(CONTAINER, "py-16 sm:py-20")}>
        <div className="bg-black px-4 py-10 shadow-none sm:px-12 sm:py-16 sm:shadow-[0_30px_90px_rgba(0,0,0,0.18)] md:rounded-3xl">
          <CountDownHeader />

          {/* Mobile layout: Days (full row), Hours + Minutes; no Seconds */}
          <div
            className={cn(
              "mx-auto mt-10 w-fit max-w-full",
              "grid grid-cols-2 items-end justify-items-center gap-x-10 gap-y-10",
              "md:hidden",
            )}
          >
            <CountDownUnit
              label="Days"
              value={fullDays}
              minDigits={daysMinDigits}
              className="col-span-2"
            />
            <CountDownUnit label="Hours" value={hours} minDigits={2} />
            <CountDownUnit label="Minutes" value={minutes} minDigits={2} />
          </div>

          {/* Desktop layout: 2x2 grid (Days, Hours / Minutes, Seconds) */}
          <div
            className={cn(
              "mx-auto mt-10 w-fit max-w-full",
              "hidden md:grid md:grid-cols-2 md:items-end md:justify-items-center md:gap-x-16 md:gap-y-12",
            )}
          >
            <CountDownUnit
              label="Days"
              value={fullDays}
              minDigits={daysMinDigits}
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
