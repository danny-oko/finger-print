"use client";

import { ArrowDown, ArrowUp, Phone, Ticket, UserRound, Users } from "lucide-react";

import { AttendeeActions } from "@/components/admin/RowActions";
import { StateBadge } from "@/components/admin/StateBadge";
import {
  ATTENDEE_SORT_LABEL,
  PATH_LABEL,
  rowState,
  type AttendeeSortKey,
  type SortDirection,
} from "@/lib/admin/monitor";
import type { MonitorRow } from "@/lib/admin/types";
import { cn } from "@/lib/utils";
import { formatGrade, formatGradeShort } from "@/lib/registration/grade";

function formatDate(iso: string): string {
  const date = new Date(iso);
  return Number.isNaN(date.getTime())
    ? "—"
    : date.toLocaleDateString("mn-MN", { month: "2-digit", day: "2-digit" }) +
        " " +
        date.toLocaleTimeString("mn-MN", { hour: "2-digit", minute: "2-digit" });
}

function PathChip({ row }: { row: MonitorRow }) {
  const viaLeader = row.registrantType === "church_leader";

  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium whitespace-nowrap",
        viaLeader
          ? "border-violet-200 bg-violet-50 text-violet-700"
          : "border-neutral-200 bg-neutral-50 text-neutral-600",
      )}
    >
      {viaLeader ? <Users className="size-3" /> : <UserRound className="size-3" />}
      {PATH_LABEL[row.registrantType]}
    </span>
  );
}

const COLUMNS: { key: AttendeeSortKey; className?: string }[] = [
  { key: "fullName" },
  { key: "churchName" },
  { key: "grade", className: "w-20" },
  { key: "path", className: "w-32" },
  { key: "payerName" },
  { key: "state", className: "w-36" },
  { key: "ticketCode", className: "w-32" },
  { key: "registeredAt", className: "w-28" },
];

export function AttendeeView({
  rows,
  sortKey,
  sortDirection,
  onSortChange,
  onEdit,
  onDelete,
}: {
  rows: MonitorRow[];
  sortKey: AttendeeSortKey;
  sortDirection: SortDirection;
  onSortChange: (key: AttendeeSortKey, direction: SortDirection) => void;
  onEdit: (row: MonitorRow) => void;
  onDelete: (row: MonitorRow) => void;
}) {
  function handleHeaderClick(key: AttendeeSortKey) {
    if (key === sortKey) {
      onSortChange(key, sortDirection === "asc" ? "desc" : "asc");
    } else {
      // Dates read most-recent-first by default; everything else A→Z.
      onSortChange(key, key === "registeredAt" ? "desc" : "asc");
    }
  }

  if (rows.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-neutral-300 py-12 text-center text-sm text-neutral-500">
        Тохирох бүртгэл олдсонгүй.
      </p>
    );
  }

  return (
    <>
      {/* Phones: one tappable card per attendee */}
      <ul className="grid grid-cols-[minmax(0,1fr)] gap-2 md:hidden">
        {rows.map((row) => (
          <li
            key={row.attendeeId}
            className="rounded-xl border border-neutral-200 bg-white p-3"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="truncate font-bold text-neutral-900">{row.fullName}</p>
                <p className="truncate text-sm text-neutral-500">
                  {row.churchName} · {formatGrade(row)}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-1">
                <StateBadge state={rowState(row)} />
                <AttendeeActions
                  name={row.fullName}
                  onEdit={() => onEdit(row)}
                  onDelete={() => onDelete(row)}
                />
              </div>
            </div>

            <div className="mt-2 flex flex-wrap items-center gap-1.5">
              <PathChip row={row} />
              {row.ticketCode && (
                <span className="inline-flex items-center gap-1 rounded-full border border-neutral-200 bg-neutral-50 px-2 py-0.5 font-mono text-[11px] text-neutral-600">
                  <Ticket className="size-3" />
                  {row.ticketCode}
                </span>
              )}
              {row.checkedInAt && (
                <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700">
                  Ирсэн
                </span>
              )}
            </div>

            <div className="mt-2 border-t border-neutral-100 pt-2 text-xs text-neutral-500">
              <p className="truncate">
                Төлөгч: <span className="text-neutral-700">{row.payerName}</span>
              </p>
              <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1">
                {row.phone && (
                  <a href={`tel:${row.phone}`} className="inline-flex items-center gap-1 text-[#F98C01]">
                    <Phone className="size-3" />
                    {row.phone}
                  </a>
                )}
                {row.parentPhone && (
                  <a
                    href={`tel:${row.parentPhone}`}
                    className="inline-flex items-center gap-1 text-neutral-500"
                  >
                    <Phone className="size-3" />
                    Эцэг эх: {row.parentPhone}
                  </a>
                )}
                <span>{formatDate(row.registrationCreatedAt)}</span>
              </div>
            </div>
          </li>
        ))}
      </ul>

      {/* md+: sortable table */}
      <div className="hidden overflow-x-auto rounded-xl border border-neutral-200 bg-white md:block">
        <table className="w-full min-w-[54rem] text-sm">
          <thead>
            <tr className="border-b border-neutral-200 bg-neutral-50/80">
              {COLUMNS.map((column) => {
                const active = column.key === sortKey;
                return (
                  <th
                    key={column.key}
                    scope="col"
                    aria-sort={
                      active ? (sortDirection === "asc" ? "ascending" : "descending") : "none"
                    }
                    className={cn("px-3 py-2 text-left font-semibold", column.className)}
                  >
                    <button
                      type="button"
                      onClick={() => handleHeaderClick(column.key)}
                      className={cn(
                        "inline-flex items-center gap-1 whitespace-nowrap",
                        active ? "text-neutral-900" : "text-neutral-500 hover:text-neutral-800",
                      )}
                    >
                      {ATTENDEE_SORT_LABEL[column.key]}
                      {active &&
                        (sortDirection === "asc" ? (
                          <ArrowUp className="size-3" />
                        ) : (
                          <ArrowDown className="size-3" />
                        ))}
                    </button>
                  </th>
                );
              })}
              <th scope="col" className="w-12 px-3 py-2">
                <span className="sr-only">Үйлдэл</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.attendeeId} className="border-b border-neutral-100 last:border-0">
                <td className="px-3 py-2">
                  <p className="font-semibold text-neutral-900">{row.fullName}</p>
                  <p className="text-xs text-neutral-500">
                    {[row.phone, row.parentPhone && `эцэг эх ${row.parentPhone}`]
                      .filter(Boolean)
                      .join(" · ") || "—"}
                  </p>
                </td>
                <td className="px-3 py-2 text-neutral-700">{row.churchName}</td>
                <td className="px-3 py-2 text-neutral-700">{formatGradeShort(row)}</td>
                <td className="px-3 py-2">
                  <PathChip row={row} />
                </td>
                <td className="px-3 py-2">
                  <p className="text-neutral-700">{row.payerName}</p>
                  <p className="text-xs text-neutral-400">{row.payerPhone}</p>
                </td>
                <td className="px-3 py-2">
                  <StateBadge state={rowState(row)} />
                  {row.checkedInAt && (
                    <span className="mt-1 block text-[11px] font-medium text-emerald-700">
                      Ирсэн
                    </span>
                  )}
                </td>
                <td className="px-3 py-2 font-mono text-xs text-neutral-600">
                  {row.ticketCode ?? "—"}
                </td>
                <td className="px-3 py-2 text-xs whitespace-nowrap text-neutral-500">
                  {formatDate(row.registrationCreatedAt)}
                </td>
                <td className="px-3 py-2">
                  <AttendeeActions
                    name={row.fullName}
                    onEdit={() => onEdit(row)}
                    onDelete={() => onDelete(row)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
