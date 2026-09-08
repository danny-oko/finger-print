"use client";

import { ChevronDown, Mail, Phone, Ticket, UserRound, Users } from "lucide-react";
import * as React from "react";

import { StateBadge } from "@/components/admin/StateBadge";
import {
  PATH_LABEL,
  REGISTRATION_SORT_LABEL,
  rowState,
  type RegistrationGroup,
  type RegistrationSortKey,
  type SortDirection,
} from "@/lib/admin/monitor";
import { formatMnt } from "@/lib/registration/pricing";
import { cn } from "@/lib/utils";
import { formatGrade } from "@/lib/registration/grade";

function formatDateTime(iso: string): string {
  const date = new Date(iso);
  return Number.isNaN(date.getTime())
    ? "—"
    : `${date.toLocaleDateString("mn-MN")} ${date.toLocaleTimeString("mn-MN", {
        hour: "2-digit",
        minute: "2-digit",
      })}`;
}

function RegistrationCard({ group }: { group: RegistrationGroup }) {
  const [open, setOpen] = React.useState(false);
  const viaLeader = group.registrantType === "church_leader";

  return (
    <li className="overflow-hidden rounded-xl border border-neutral-200 bg-white">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        className="flex w-full items-start gap-3 p-3 text-left"
      >
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="truncate font-bold text-neutral-900">{group.payerName}</p>
            <span
              className={cn(
                "inline-flex shrink-0 items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium",
                viaLeader
                  ? "border-violet-200 bg-violet-50 text-violet-700"
                  : "border-neutral-200 bg-neutral-50 text-neutral-600",
              )}
            >
              {viaLeader ? <Users className="size-3" /> : <UserRound className="size-3" />}
              {PATH_LABEL[group.registrantType]}
            </span>
          </div>

          <p className="mt-0.5 truncate text-xs text-neutral-500">
            {group.attendeeCount} хүн · {group.churches.join(", ")}
          </p>
          <p className="mt-0.5 text-xs text-neutral-400">{formatDateTime(group.createdAt)}</p>
        </div>

        <div className="flex shrink-0 flex-col items-end gap-1">
          <StateBadge state={group.state} />
          <span className="text-sm font-black text-[#F98C01]">{formatMnt(group.totalMnt)}</span>
        </div>

        <ChevronDown
          className={cn(
            "mt-1 size-4 shrink-0 text-neutral-400 transition-transform",
            open && "rotate-180",
          )}
        />
      </button>

      {open && (
        <div className="grid gap-3 border-t border-neutral-100 bg-neutral-50/60 p-3">
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs">
            <a
              href={`tel:${group.payerPhone}`}
              className="inline-flex items-center gap-1 text-[#F98C01]"
            >
              <Phone className="size-3" />
              {group.payerPhone}
            </a>
            {group.payerEmail && (
              <a
                href={`mailto:${group.payerEmail}`}
                className="inline-flex items-center gap-1 text-neutral-600"
              >
                <Mail className="size-3" />
                {group.payerEmail}
              </a>
            )}
            <span className="text-neutral-500">
              Тасалбар: {group.ticketsIssuedAt ? "илгээсэн" : "илгээгээгүй"}
            </span>
            {group.paidAt && (
              <span className="text-neutral-500">Төлсөн: {formatDateTime(group.paidAt)}</span>
            )}
          </div>

          <ul className="divide-y divide-neutral-100">
            {group.rows.map((row) => (
              <li key={row.attendeeId} className="flex items-center justify-between gap-2 py-1.5">
                <div className="min-w-0">
                  <p className="truncate text-sm text-neutral-800">{row.fullName}</p>
                  <p className="truncate text-[11px] text-neutral-400">
                    {row.churchName} · {formatGrade(row)}
                  </p>
                </div>
                {row.ticketCode ? (
                  <span className="inline-flex shrink-0 items-center gap-1 font-mono text-[11px] text-neutral-500">
                    <Ticket className="size-3" />
                    {row.ticketCode}
                  </span>
                ) : (
                  <StateBadge state={rowState(row)} />
                )}
              </li>
            ))}
          </ul>

          {group.state !== "paid" && group.bylCheckoutUrl && (
            <a
              href={group.bylCheckoutUrl}
              target="_blank"
              rel="noreferrer"
              className="text-xs font-medium text-[#F98C01] underline underline-offset-2"
            >
              Byl төлбөрийн хуудас нээх
            </a>
          )}

          <p className="font-mono text-[10px] break-all text-neutral-400">{group.registrationId}</p>
        </div>
      )}
    </li>
  );
}

export function RegistrationView({
  groups,
  sortKey,
  sortDirection,
  onSortChange,
}: {
  groups: RegistrationGroup[];
  sortKey: RegistrationSortKey;
  sortDirection: SortDirection;
  onSortChange: (key: RegistrationSortKey, direction: SortDirection) => void;
}) {
  if (groups.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-neutral-300 py-12 text-center text-sm text-neutral-500">
        Тохирох төлбөр олдсонгүй.
      </p>
    );
  }

  return (
    <div className="grid gap-3">
      <div className="hidden flex-wrap items-center gap-1 md:flex">
        <span className="mr-1 text-xs text-neutral-500">Эрэмбэ:</span>
        {(Object.keys(REGISTRATION_SORT_LABEL) as RegistrationSortKey[]).map((key) => {
          const active = key === sortKey;
          return (
            <button
              key={key}
              type="button"
              onClick={() =>
                active
                  ? onSortChange(key, sortDirection === "asc" ? "desc" : "asc")
                  : onSortChange(key, key === "payerName" ? "asc" : "desc")
              }
              className={cn(
                "rounded-full border px-2.5 py-1 text-xs font-medium transition-colors",
                active
                  ? "border-neutral-900 bg-neutral-900 text-white"
                  : "border-neutral-200 bg-white text-neutral-600 hover:border-neutral-300",
              )}
            >
              {REGISTRATION_SORT_LABEL[key]}
              {active && (sortDirection === "asc" ? " ↑" : " ↓")}
            </button>
          );
        })}
      </div>

      <ul className="grid grid-cols-[minmax(0,1fr)] gap-2">
        {groups.map((group) => (
          <RegistrationCard key={group.registrationId} group={group} />
        ))}
      </ul>
    </div>
  );
}
