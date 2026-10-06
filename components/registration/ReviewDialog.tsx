"use client";

import { Loader2 } from "lucide-react";

import { QueueWaiting } from "@/components/registration/QueueWaiting";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { QueueView } from "@/hooks/use-queue-pass";
import { formatGrade, toGradeColumns } from "@/lib/registration/grade";
import { computePricing, formatMnt, type PricingSettings } from "@/lib/registration/pricing";
import type { RegistrationFormOutput } from "@/lib/registration/schema";

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 text-[15px]">
      <dt className="shrink-0 text-ink/60">{label}</dt>
      <dd className="text-right font-medium text-ink">{value}</dd>
    </div>
  );
}

export type SubmitPhase = "idle" | "queue" | "saving";

export function ReviewDialog({
  values,
  pricing,
  phase,
  queue,
  onEdit,
  onConfirm,
  onLeaveQueue,
}: {
  values: RegistrationFormOutput | null;
  pricing: PricingSettings | null;
  phase: SubmitPhase;
  queue: QueueView;
  onEdit: () => void;
  onConfirm: () => void;
  onLeaveQueue: () => void;
}) {
  const breakdown = pricing && values ? computePricing(pricing, values.attendees.length) : null;
  const isGroup = values?.mode === "group";
  const busy = phase !== "idle";

  return (
    <Dialog
      open={values !== null}
      onOpenChange={(open) => {
        if (!open && !busy) onEdit();
      }}
    >
      <DialogContent
        showCloseButton={!busy}
        className="event-ui max-h-[92dvh] gap-0 overflow-hidden rounded-2xl p-0 sm:max-w-lg"
      >
        {values && (
          <div className="flex max-h-[92dvh] flex-col">
            <DialogHeader className="px-6 pt-6 pb-4 text-left">
              <DialogTitle className="text-xl font-bold text-ink">
                Мэдээллээ шалгана уу
              </DialogTitle>
              <DialogDescription className="text-[15px] text-ink/60">
                Төлбөр төлөгдмөгц хүн бүрийн QR тасалбар гарч ирнэ.
              </DialogDescription>
            </DialogHeader>

            <div className="min-h-0 flex-1 overflow-y-auto border-y border-black/10 bg-mist px-6 py-5">
              <dl className="grid gap-2">
                <Row label="Цуглаан" value={values.churchName} />
                {isGroup && (
                  <Row label="Бүртгэж буй" value={`${values.payerName}, ${values.payerPhone}`} />
                )}
              </dl>

              <ol className="mt-4 grid gap-2">
                {values.attendees.map((a, i) => (
                  <li
                    key={`${a.fullName}-${i}`}
                    className="flex items-start justify-between gap-3 rounded-xl bg-white px-4 py-3"
                  >
                    <span className="min-w-0">
                      <span className="block truncate font-semibold text-ink">{a.fullName}</span>
                      <span className="block text-sm text-ink/60">
                        {formatGrade(toGradeColumns(a.grade))}
                        {a.phone ? `, ${a.phone}` : ""}
                      </span>
                    </span>
                    {breakdown && (
                      <span className="shrink-0 text-sm text-ink/60 tabular-nums">
                        {formatMnt(breakdown.pricePerAttendeeMnt)}
                      </span>
                    )}
                  </li>
                ))}
              </ol>
            </div>

            <div className="px-6 pt-4 pb-6">
              <dl className="grid gap-1.5">
                {breakdown && breakdown.taxMnt > 0 && (
                  <Row label={`Татвар (${breakdown.taxRatePercent}%)`} value={formatMnt(breakdown.taxMnt)} />
                )}
                <div className="flex items-baseline justify-between">
                  <dt className="font-semibold text-ink">Нийт төлөх</dt>
                  <dd className="text-2xl font-bold text-ink tabular-nums">
                    {breakdown ? formatMnt(breakdown.totalMnt) : "—"}
                  </dd>
                </div>
              </dl>

              {phase === "queue" ? (
                <div className="mt-4">
                  <QueueWaiting view={queue} onLeave={onLeaveQueue} />
                </div>
              ) : (
                <div className="mt-5 grid gap-2">
                  <button
                    type="button"
                    onClick={onConfirm}
                    disabled={busy}
                    className="flex h-13 items-center justify-center gap-2 rounded-full bg-brand text-base font-semibold text-ink transition-colors hover:bg-brand-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink disabled:opacity-70"
                  >
                    {phase === "saving" ? (
                      <>
                        <Loader2 className="size-5 animate-spin" />
                        Төлбөрийн хуудас нээж байна…
                      </>
                    ) : (
                      `${breakdown ? formatMnt(breakdown.totalMnt) : ""} төлөх`
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={onEdit}
                    disabled={busy}
                    className="h-11 rounded-full text-[15px] font-semibold text-ink/70 hover:bg-mist focus-visible:outline-2 focus-visible:outline-ink disabled:opacity-50"
                  >
                    Буцаж засах
                  </button>
                  <p className="pt-1 text-center text-[13px] text-ink/50">
                    QPay, SocialPay эсвэл банкны картаар төлж болно.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
