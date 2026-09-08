"use client";

import { ChevronDown, Link2, Phone, RotateCcw, UserRound, Users } from "lucide-react";
import * as React from "react";

import { StateBadge } from "@/components/admin/StateBadge";
import { Button } from "@/components/ui/button";
import {
  CHURCH_SORT_LABEL,
  rowState,
  type ChurchGroup,
  type ChurchSortKey,
  type SortDirection,
} from "@/lib/admin/monitor";
import type { MonitorRow } from "@/lib/admin/types";
import { formatMnt } from "@/lib/registration/pricing";
import { cn } from "@/lib/utils";
import { formatGrade } from "@/lib/registration/grade";

function AttendeeLine({ row }: { row: MonitorRow }) {
  return (
    <li className="flex items-center justify-between gap-2 py-1.5">
      <div className="min-w-0">
        <p className="truncate text-sm text-neutral-800">{row.fullName}</p>
        <p className="truncate text-[11px] text-neutral-400">
          {formatGrade(row)}
          {row.ticketCode ? ` · ${row.ticketCode}` : ""}
        </p>
      </div>
      <StateBadge state={rowState(row)} />
    </li>
  );
}

function PathSection({
  title,
  icon,
  rows,
}: {
  title: string;
  icon: React.ReactNode;
  rows: MonitorRow[];
}) {
  if (rows.length === 0) return null;

  return (
    <div>
      <p className="flex items-center gap-1.5 text-[11px] font-semibold tracking-wide text-neutral-500 uppercase">
        {icon}
        {title} ({rows.length})
      </p>
      <ul className="mt-1 divide-y divide-neutral-100">
        {rows.map((row) => (
          <AttendeeLine key={row.attendeeId} row={row} />
        ))}
      </ul>
    </div>
  );
}

function GroupCard({ group }: { group: ChurchGroup }) {
  const [open, setOpen] = React.useState(false);

  const paidPercent =
    group.attendeeCount > 0 ? Math.round((group.paidCount / group.attendeeCount) * 100) : 0;

  const selfRows = group.rows.filter((row) => row.registrantType === "individual");
  const leaderRows = group.rows.filter((row) => row.registrantType === "church_leader");

  return (
    <li className="overflow-hidden rounded-xl border border-neutral-200 bg-white">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        className="flex w-full items-start gap-3 p-3 text-left"
      >
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="truncate font-bold text-neutral-900">{group.displayName}</p>
            <span className="shrink-0 rounded-full bg-neutral-100 px-2 py-0.5 text-[11px] font-bold text-neutral-700">
              {group.attendeeCount}
            </span>
          </div>

          <p className="mt-0.5 truncate text-xs text-neutral-500">
            {group.selfRegisteredCount} хувиараа · {group.viaLeaderCount} ахлагчаар ·{" "}
            {group.registrationCount} төлбөр
          </p>

          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-neutral-100">
            <div
              className="h-full rounded-full bg-emerald-500 transition-[width]"
              style={{ width: `${paidPercent}%` }}
            />
          </div>

          <p className="mt-1 text-[11px] text-neutral-500">
            <span className="font-semibold text-emerald-700">{group.paidCount} төлсөн</span>
            {group.unpaidCount > 0 && (
              <span className="text-amber-700"> · {group.unpaidCount} төлөөгүй</span>
            )}
            {group.awaitingCount > 0 && (
              <span className="text-sky-700"> · {group.awaitingCount} шалгах</span>
            )}
            <span className="text-neutral-400"> · {formatMnt(group.paidRevenueMnt)}</span>
          </p>
        </div>

        <ChevronDown
          className={cn(
            "mt-1 size-4 shrink-0 text-neutral-400 transition-transform",
            open && "rotate-180",
          )}
        />
      </button>

      {open && (
        <div className="grid gap-4 border-t border-neutral-100 bg-neutral-50/60 p-3">
          {group.variants.length > 1 && (
            <p className="text-[11px] text-neutral-500">
              Бичигдсэн хувилбарууд: {group.variants.join(" · ")}
            </p>
          )}

          {group.leaders.length > 0 && (
            <div>
              <p className="text-[11px] font-semibold tracking-wide text-neutral-500 uppercase">
                Ахлагч ({group.leaders.length})
              </p>
              <ul className="mt-1 grid gap-1.5">
                {group.leaders.map((leader) => (
                  <li
                    key={leader.registrationId}
                    className="flex items-center justify-between gap-2 rounded-lg border border-neutral-200 bg-white px-2.5 py-2"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-neutral-800">
                        {leader.name}
                      </p>
                      <a
                        href={`tel:${leader.phone}`}
                        className="inline-flex items-center gap-1 text-[11px] text-[#F98C01]"
                      >
                        <Phone className="size-3" />
                        {leader.phone}
                      </a>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <span className="text-[11px] text-neutral-500">
                        {leader.attendeeCount} хүн
                      </span>
                      <StateBadge state={leader.state} />
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <PathSection
            title="Ахлагчаар бүртгүүлсэн"
            icon={<Users className="size-3" />}
            rows={leaderRows}
          />
          <PathSection
            title="Хувиараа бүртгүүлсэн"
            icon={<UserRound className="size-3" />}
            rows={selfRows}
          />
        </div>
      )}
    </li>
  );
}

export function ChurchView({
  groups,
  sortKey,
  sortDirection,
  onSortChange,
  similarPairs,
  onMerge,
  mergeCount,
  onResetMerges,
}: {
  groups: ChurchGroup[];
  sortKey: ChurchSortKey;
  sortDirection: SortDirection;
  onSortChange: (key: ChurchSortKey, direction: SortDirection) => void;
  similarPairs: [ChurchGroup, ChurchGroup][];
  onMerge: (fromKey: string, intoKey: string) => void;
  mergeCount: number;
  onResetMerges: () => void;
}) {
  if (groups.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-neutral-300 py-12 text-center text-sm text-neutral-500">
        Тохирох сүм олдсонгүй.
      </p>
    );
  }

  return (
    <div className="grid gap-3">
      {/* Churches are grouped by a normalized name, so case, punctuation and
          Cyrillic/Latin spellings already fold together. These are the pairs
          that are merely *close* — a real typo needs a human to confirm. */}
      {similarPairs.length > 0 && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-3">
          <p className="text-xs font-semibold text-amber-900">
            Ижил төстэй нэртэй сүм олдлоо — нэг сүм байж магадгүй.
          </p>
          <ul className="mt-2 grid gap-1.5">
            {similarPairs.map(([a, b]) => (
              <li
                key={`${a.key}|${b.key}`}
                className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-white px-2.5 py-2"
              >
                <span className="text-xs text-neutral-700">
                  <strong>{a.displayName}</strong> ({a.attendeeCount}) ·{" "}
                  <strong>{b.displayName}</strong> ({b.attendeeCount})
                </span>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="h-7"
                  onClick={() => onMerge(b.key, a.key)}
                >
                  <Link2 className="size-3" />
                  Нэгтгэх
                </Button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {mergeCount > 0 && (
        <div className="flex items-center justify-between gap-2 rounded-xl border border-neutral-200 bg-white px-3 py-2">
          <p className="text-xs text-neutral-600">{mergeCount} сүм гараар нэгтгэсэн.</p>
          <Button type="button" size="sm" variant="ghost" className="h-7" onClick={onResetMerges}>
            <RotateCcw className="size-3" />
            Буцаах
          </Button>
        </div>
      )}

      {/* md+ gets header-style sort buttons; phones use the filter sheet. */}
      <div className="hidden flex-wrap items-center gap-1 md:flex">
        <span className="mr-1 text-xs text-neutral-500">Эрэмбэ:</span>
        {(Object.keys(CHURCH_SORT_LABEL) as ChurchSortKey[]).map((key) => {
          const active = key === sortKey;
          return (
            <button
              key={key}
              type="button"
              onClick={() =>
                active
                  ? onSortChange(key, sortDirection === "asc" ? "desc" : "asc")
                  : onSortChange(key, key === "displayName" ? "asc" : "desc")
              }
              className={cn(
                "rounded-full border px-2.5 py-1 text-xs font-medium transition-colors",
                active
                  ? "border-neutral-900 bg-neutral-900 text-white"
                  : "border-neutral-200 bg-white text-neutral-600 hover:border-neutral-300",
              )}
            >
              {CHURCH_SORT_LABEL[key]}
              {active && (sortDirection === "asc" ? " ↑" : " ↓")}
            </button>
          );
        })}
      </div>

      <ul className="grid grid-cols-[minmax(0,1fr)] gap-2">
        {groups.map((group) => (
          <GroupCard key={group.key} group={group} />
        ))}
      </ul>
    </div>
  );
}
