"use client";

import Link from "next/link";
import * as React from "react";

import { InviteFriendLink } from "@/components/invite/InviteFriendLink";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/lib/useTranslation";
import { cn } from "@/lib/utils";
import CountDownHeader from "./CountDownHeader";
import CountDownUnit from "./CountDownUnit";
import { TARGET_ISO, getTimeLeft, pad2, type TimeLeft } from "./utils";

const CONTAINER = "mx-auto w-full md:w-[min(calc(100%-2rem),80vw,1200px)]";

export default function CountDown() {
  const { t } = useTranslation();
  // Starts at all-zeros so server and client render identically before
  // hydration; the effect below (client-only) then starts ticking real
  // values in, no separate "mounted" flag needed.
  const [time, setTime] = React.useState<TimeLeft>({
    totalMs: 0,
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  React.useEffect(() => {
    const target = new Date(TARGET_ISO);
    const tick = () => setTime(getTimeLeft(target));
    tick();

    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, []);

  const fullDays = String(time.days);
  const daysMinDigits = Math.max(3, fullDays.length);

  const hours = pad2(time.hours);
  const minutes = pad2(time.minutes);
  const seconds = pad2(time.seconds);

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
              label={t("countdown.days")}
              value={fullDays}
              minDigits={daysMinDigits}
              className="col-span-2"
            />
            <CountDownUnit
              label={t("countdown.hours")}
              value={hours}
              minDigits={2}
            />
            <CountDownUnit
              label={t("countdown.minutes")}
              value={minutes}
              minDigits={2}
            />
          </div>

          {/* Desktop layout:
              - md–lg: 2x2 grid
              - xl+: single centered row */}
          <div
            className={cn(
              "mx-auto mt-10 w-fit max-w-full",
              "hidden md:grid md:grid-cols-2 md:items-end md:justify-items-center md:gap-x-16 md:gap-y-10",
              "xl:flex xl:flex-row xl:flex-nowrap xl:items-end xl:justify-center xl:gap-12",
            )}
          >
            <CountDownUnit
              label={t("countdown.days")}
              value={fullDays}
              minDigits={daysMinDigits}
            />
            <CountDownUnit
              label={t("countdown.hours")}
              value={hours}
              minDigits={2}
            />
            <CountDownUnit
              label={t("countdown.minutes")}
              value={minutes}
              minDigits={2}
            />
            <CountDownUnit
              label={t("countdown.seconds")}
              value={seconds}
              minDigits={2}
            />
          </div>

          <div className="mx-auto mt-12 flex max-w-md flex-col items-center gap-3 text-center">
            <p className="text-sm text-white/60">{t("register.bannerSubtitle")}</p>
            <div className="flex items-center gap-3">
              <Button className="h-11 rounded-full px-8 text-black" asChild>
                <Link href="/event/registration">{t("register.button")}</Link>
              </Button>
              <InviteFriendLink className="size-11 bg-white/10 text-white ring-1 ring-white/20 hover:bg-white/20" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
