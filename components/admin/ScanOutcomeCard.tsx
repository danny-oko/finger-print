"use client";

import { CheckCircle2, Clock, CloudOff, RotateCcw, TriangleAlert, XCircle } from "lucide-react";

import {
  formatCheckInTime,
  OUTCOME_HINT,
  OUTCOME_TITLE,
  OUTCOME_TONE,
  type CheckInResult,
  type OutcomeTone,
} from "@/lib/admin/checkIn";
import { formatGrade } from "@/lib/registration/grade";
import { cn } from "@/lib/utils";

export type DoorResult = CheckInResult | { outcome: "offline"; code: string };

const TONE_CARD: Record<OutcomeTone, string> = {
  success: "bg-emerald-500 text-emerald-950",
  warning: "bg-amber-400 text-amber-950",
  danger: "bg-red-500 text-white",
};

const TONE_ICON = { success: CheckCircle2, warning: TriangleAlert, danger: XCircle };

export function toneOf(result: DoorResult): OutcomeTone {
  return result.outcome === "offline" ? "warning" : OUTCOME_TONE[result.outcome];
}

export function ScanOutcomeCard({
  result,
  onUndo,
  onDismiss,
  undoing = false,
}: {
  result: DoorResult;
  onUndo?: () => void;
  onDismiss: () => void;
  undoing?: boolean;
}) {
  const tone = toneOf(result);
  const Icon = result.outcome === "offline" ? CloudOff : TONE_ICON[tone];
  const attendee = "attendee" in result ? result.attendee : null;
  const code = "code" in result ? result.code : null;

  const title = result.outcome === "offline" ? "Сүлжээгүй — хадгаллаа" : OUTCOME_TITLE[result.outcome];
  const hint =
    result.outcome === "offline"
      ? "Сүлжээ орохоор автоматаар шалгана. Асуудалтай бол дээр мэдэгдэнэ."
      : OUTCOME_HINT[result.outcome];

  return (
    <section
      role="status"
      aria-live="assertive"
      className={cn("rounded-3xl p-5 shadow-2xl", TONE_CARD[tone])}
      onClick={tone === "success" ? onDismiss : undefined}
    >
      <div className="flex items-center gap-2">
        <Icon className="size-6 shrink-0" />
        <p className="text-lg font-bold">{title}</p>
      </div>

      {attendee ? (
        <>
          <p className="mt-3 text-[1.9rem] leading-tight font-black break-words">{attendee.fullName}</p>
          <p className="mt-1 text-base font-medium opacity-80">
            {formatGrade(attendee)}, {attendee.churchName}
          </p>
        </>
      ) : (
        <p className="mt-3 font-mono text-2xl font-bold break-all">{code || "—"}</p>
      )}

      <p className="mt-3 text-[15px] leading-snug opacity-85">{hint}</p>

      {attendee && result.outcome === "already" && (
        <p className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-black/15 px-3 py-1 text-sm font-semibold">
          <Clock className="size-4" />
          {formatCheckInTime(attendee.checkedInAt)}-д орсон
        </p>
      )}

      <div className="mt-4 flex flex-wrap gap-2">
        {onUndo && result.outcome === "checked_in" && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onUndo();
            }}
            disabled={undoing}
            className="inline-flex h-11 items-center gap-2 rounded-full bg-black/15 px-4 text-sm font-semibold disabled:opacity-60"
          >
            <RotateCcw className={cn("size-4", undoing && "animate-spin")} />
            {undoing ? "Буцааж байна…" : "Буруу уншсан — буцаах"}
          </button>
        )}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onDismiss();
          }}
          className="inline-flex h-11 items-center rounded-full bg-black/15 px-5 text-sm font-semibold"
        >
          Дараагийн хүн
        </button>
      </div>
    </section>
  );
}
