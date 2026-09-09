"use client";

import { CheckCircle2, Clock, RotateCcw, TriangleAlert, XCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
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

const TONE_CARD: Record<OutcomeTone, string> = {
  success: "border-emerald-400/50 bg-emerald-500/15",
  warning: "border-amber-400/50 bg-amber-500/15",
  danger: "border-red-400/50 bg-red-500/15",
};

const TONE_TEXT: Record<OutcomeTone, string> = {
  success: "text-emerald-300",
  warning: "text-amber-300",
  danger: "text-red-300",
};

const TONE_ICON = {
  success: CheckCircle2,
  warning: TriangleAlert,
  danger: XCircle,
};

export function ScanOutcomeCard({
  result,
  onUndo,
  undoing = false,
}: {
  result: CheckInResult;
  onUndo?: () => void;
  undoing?: boolean;
}) {
  const tone = OUTCOME_TONE[result.outcome];
  const Icon = TONE_ICON[tone];
  const attendee = "attendee" in result ? result.attendee : null;
  const code = "code" in result ? result.code : null;

  return (
    <section className={cn("grid gap-3 rounded-2xl border p-4", TONE_CARD[tone])}>
      <div className="flex items-start gap-3">
        <Icon className={cn("mt-0.5 size-6 shrink-0", TONE_TEXT[tone])} />

        <div className="min-w-0 flex-1">
          <p className={cn("text-sm font-bold", TONE_TEXT[tone])}>
            {OUTCOME_TITLE[result.outcome]}
          </p>

          {attendee ? (
            <>
              <p className="mt-1 truncate text-2xl leading-tight font-black text-white">
                {attendee.fullName}
              </p>
              <p className="mt-0.5 truncate text-sm text-white/70">
                {formatGrade(attendee)} · {attendee.churchName}
              </p>
            </>
          ) : (
            <p className="mt-1 font-mono text-lg font-bold break-all text-white">
              {code || "—"}
            </p>
          )}

          <p className="mt-2 text-xs leading-snug text-white/60">
            {OUTCOME_HINT[result.outcome]}
          </p>

          {attendee && result.outcome === "already" && (
            <p className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-black/25 px-2.5 py-1 text-xs font-semibold text-white/80">
              <Clock className="size-3.5" />
              {formatCheckInTime(attendee.checkedInAt)}-д орсон
            </p>
          )}

          {attendee && (
            <p className="mt-2 font-mono text-[11px] tracking-wider text-white/40">
              {attendee.ticketCode} · {attendee.payerName}
            </p>
          )}
        </div>
      </div>

      {onUndo && result.outcome === "checked_in" && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onUndo}
          disabled={undoing}
          className="justify-self-start border-white/20 bg-transparent text-white hover:bg-white/10 hover:text-white"
        >
          <RotateCcw className={undoing ? "size-4 animate-spin" : "size-4"} />
          {undoing ? "Буцааж байна..." : "Буруу уншсан — буцаах"}
        </Button>
      )}
    </section>
  );
}
