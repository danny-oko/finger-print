"use client";

import { RotateCcw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { formatCheckInTime, type CheckInAttendee } from "@/lib/admin/checkIn";
import { formatGradeShort } from "@/lib/registration/grade";

/**
 * Everyone through the door, not just the ones this phone scanned — so
 * whoever spots the mistake can undo it, even if a colleague made it.
 */
export function RecentCheckIns({
  rows,
  onUndo,
  undoingId,
}: {
  rows: CheckInAttendee[];
  onUndo: (attendee: CheckInAttendee) => void;
  undoingId: string | null;
}) {
  if (rows.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-white/15 py-8 text-center text-sm text-white/40">
        Одоогоор хэн ч бүртгэгдээгүй байна.
      </p>
    );
  }

  return (
    <ul className="grid gap-1.5">
      {rows.map((row) => (
        <li
          key={row.attendeeId}
          className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-3 py-2.5"
        >
          <span className="w-11 shrink-0 font-mono text-xs text-white/50">
            {formatCheckInTime(row.checkedInAt)}
          </span>

          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-white">{row.fullName}</p>
            <p className="truncate text-xs text-white/50">
              {formatGradeShort(row)} · {row.churchName}
            </p>
          </div>

          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={() => onUndo(row)}
            disabled={undoingId === row.attendeeId}
            aria-label={`${row.fullName} — ирсэн бүртгэлийг буцаах`}
            className="shrink-0 text-white/50 hover:bg-white/10 hover:text-white"
          >
            <RotateCcw
              className={undoingId === row.attendeeId ? "size-4 animate-spin" : "size-4"}
            />
          </Button>
        </li>
      ))}
    </ul>
  );
}
