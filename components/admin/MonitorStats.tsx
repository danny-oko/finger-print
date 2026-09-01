"use client";

import type { MonitorStats as Stats } from "@/lib/admin/monitor";
import { formatMnt } from "@/lib/registration/pricing";
import { cn } from "@/lib/utils";

type Tile = {
  label: string;
  value: string;
  hint?: string;
  tone?: "default" | "good" | "warn" | "info";
};

const TONE_CLASS: Record<NonNullable<Tile["tone"]>, string> = {
  default: "text-neutral-900",
  good: "text-emerald-700",
  warn: "text-amber-700",
  info: "text-sky-700",
};

/**
 * A horizontally scrollable strip on phones and a grid on wider screens —
 * the numbers stay one thumb-swipe away instead of pushing the actual list
 * off the first screenful.
 */
export function MonitorStats({ stats }: { stats: Stats }) {
  const tiles: Tile[] = [
    {
      label: "Нийт хүн",
      value: String(stats.attendees),
      hint: `${stats.registrations} бүртгэл`,
    },
    {
      label: "Төлсөн",
      value: String(stats.paid),
      hint: formatMnt(stats.collectedMnt),
      tone: "good",
    },
    {
      label: "Төлөөгүй",
      value: String(stats.unpaid),
      hint: formatMnt(stats.outstandingMnt),
      tone: stats.unpaid > 0 ? "warn" : "default",
    },
    {
      label: "Шилжүүлэг шалгах",
      value: String(stats.awaiting),
      hint: "гараар баталгаажуулна",
      tone: stats.awaiting > 0 ? "info" : "default",
    },
    {
      label: "Сүм",
      value: String(stats.churches),
      hint: `${stats.selfRegistered} хувиараа · ${stats.viaLeader} ахлагчаар`,
    },
    {
      label: "Ирсэн",
      value: String(stats.checkedIn),
      hint: `${stats.attendees - stats.checkedIn} хүлээгдэж буй`,
    },
  ];

  return (
    <div className="-mx-4 overflow-x-auto px-4 pb-1 sm:mx-0 sm:overflow-visible sm:px-0">
      <div className="flex min-w-max gap-2 sm:grid sm:min-w-0 sm:grid-cols-3 sm:gap-3 lg:grid-cols-6">
        {tiles.map((tile) => (
          <div
            key={tile.label}
            className="min-w-[8.5rem] rounded-xl border border-neutral-200 bg-white px-3 py-2.5 sm:min-w-0"
          >
            <p className="truncate text-[11px] font-medium text-neutral-500">{tile.label}</p>
            <p className={cn("mt-0.5 text-xl font-black", TONE_CLASS[tile.tone ?? "default"])}>
              {tile.value}
            </p>
            {tile.hint && (
              <p className="mt-0.5 truncate text-[11px] text-neutral-400">{tile.hint}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
