"use client";

import { ArrowLeft, Landmark, Loader2 } from "lucide-react";
import * as React from "react";

import { QueueWaiting } from "@/components/registration/QueueWaiting";
import { TransferDetails } from "@/components/registration/TransferDetails";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { QueueView } from "@/hooks/use-queue-pass";
import { formatGrade, toGradeColumns } from "@/lib/registration/grade";
import {
  computePricing,
  formatMnt,
  type PricingBreakdown,
  type PricingSettings,
} from "@/lib/registration/pricing";
import type { PaymentMethod, RegistrationFormOutput } from "@/lib/registration/schema";
import { transferReference } from "@/lib/registration/transfer";

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 text-[15px]">
      <dt className="shrink-0 text-ink/60">{label}</dt>
      <dd className="text-right font-medium text-ink">{value}</dd>
    </div>
  );
}

export type SubmitPhase = "idle" | "queue" | "saving";

export const PRIMARY_CLASS =
  "flex h-13 items-center justify-center gap-2 rounded-full bg-brand text-base font-semibold text-ink transition-colors hover:bg-brand-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink disabled:opacity-70";
export const SECONDARY_CLASS =
  "flex h-12 items-center justify-center gap-2 rounded-full border border-black/15 text-[15px] font-semibold text-ink transition-colors hover:bg-mist focus-visible:outline-2 focus-visible:outline-ink disabled:opacity-50";
export const TERTIARY_CLASS =
  "flex h-11 items-center justify-center gap-1.5 rounded-full text-[15px] font-semibold text-ink/70 hover:bg-mist focus-visible:outline-2 focus-visible:outline-ink disabled:opacity-50";

function referenceFor(values: RegistrationFormOutput): string {
  const isGroup = values.mode === "group";
  const first = values.attendees[0];
  return transferReference({
    payerName: isGroup ? (values.payerName ?? "") : first.fullName,
    churchName: values.churchName,
    payerPhone: isGroup ? (values.payerPhone ?? "") : (first.phone ?? ""),
  });
}

export function ReviewList({
  values,
  breakdown,
}: {
  values: RegistrationFormOutput;
  breakdown: PricingBreakdown | null;
}) {
  const isGroup = values.mode === "group";

  return (
    <div className="min-h-0 flex-1 overflow-y-auto border-y border-black/10 bg-mist px-6 py-5">
      <dl className="grid gap-2">
        <Row label="Цуглаан" value={values.churchName} />
        {isGroup && (
          <Row label="Бүртгэж буй" value={[values.payerName, values.payerPhone].filter(Boolean).join(", ")} />
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
  );
}

export function ReviewTotal({ breakdown }: { breakdown: PricingBreakdown | null }) {
  return (
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
  );
}

type StepProps = {
  values: RegistrationFormOutput;
  breakdown: PricingBreakdown | null;
  phase: SubmitPhase;
  queue: QueueView;
  onLeaveQueue: () => void;
};

function SummaryStep({
  values,
  breakdown,
  phase,
  queue,
  onLeaveQueue,
  onPayOnline,
  onTransfer,
  onEdit,
}: StepProps & { onPayOnline: () => void; onTransfer: () => void; onEdit: () => void }) {
  const busy = phase !== "idle";

  return (
    <>
      <DialogHeader className="px-6 pt-6 pb-4 text-left">
        <DialogTitle className="text-xl font-bold text-ink">Мэдээллээ шалгана уу</DialogTitle>
        <DialogDescription className="text-[15px] text-ink/60">
          Төлбөр төлөгдмөгц хүн бүрийн QR тасалбар гарч ирнэ.
        </DialogDescription>
      </DialogHeader>

      <ReviewList values={values} breakdown={breakdown} />

      <div className="px-6 pt-4 pb-6">
        <ReviewTotal breakdown={breakdown} />

        {phase === "queue" ? (
          <div className="mt-4">
            <QueueWaiting view={queue} onLeave={onLeaveQueue} />
          </div>
        ) : (
          <div className="mt-5 grid gap-2">
            <button type="button" onClick={onPayOnline} disabled={busy} className={PRIMARY_CLASS}>
              {phase === "saving" ? (
                <>
                  <Loader2 className="size-5 animate-spin" />
                  Төлбөрийн хуудас нээж байна…
                </>
              ) : (
                `${breakdown ? formatMnt(breakdown.totalMnt) : ""} онлайн төлөх`
              )}
            </button>
            <button type="button" onClick={onTransfer} disabled={busy} className={SECONDARY_CLASS}>
              <Landmark className="size-4.5" />
              Дансаар шилжүүлэх
            </button>
            <button type="button" onClick={onEdit} disabled={busy} className={TERTIARY_CLASS}>
              Буцаж засах
            </button>
            <p className="pt-1 text-center text-[13px] text-ink/50">
              Онлайнаар QPay, SocialPay эсвэл картаар төлнө.
            </p>
          </div>
        )}
      </div>
    </>
  );
}

function TransferStep({
  values,
  breakdown,
  phase,
  queue,
  onLeaveQueue,
  onSend,
  onBack,
}: StepProps & { onSend: () => void; onBack: () => void }) {
  const busy = phase !== "idle";

  return (
    <>
      <DialogHeader className="px-6 pt-6 pb-4 text-left">
        <DialogTitle className="text-xl font-bold text-ink">Дансаар шилжүүлэх</DialogTitle>
        <DialogDescription className="text-[15px] text-ink/60">
          Эхлээд доорх данс руу шилжүүлээд, дараа нь хүсэлтээ илгээнэ үү. Ажилтан шалгаж
          баталгаажуулмагц тасалбар тань гарна.
        </DialogDescription>
      </DialogHeader>

      <div className="min-h-0 flex-1 overflow-y-auto px-6 pb-1">
        <TransferDetails totalMnt={breakdown?.totalMnt ?? null} reference={referenceFor(values)} />
      </div>

      <div className="px-6 pt-4 pb-6">
        {phase === "queue" ? (
          <QueueWaiting view={queue} onLeave={onLeaveQueue} />
        ) : (
          <div className="grid gap-2">
            <button type="button" onClick={onSend} disabled={busy} className={PRIMARY_CLASS}>
              {phase === "saving" ? (
                <>
                  <Loader2 className="size-5 animate-spin" />
                  Илгээж байна…
                </>
              ) : (
                "Шилжүүлсэн, хүсэлт илгээх"
              )}
            </button>
            <button type="button" onClick={onBack} disabled={busy} className={TERTIARY_CLASS}>
              <ArrowLeft className="size-4" />
              Буцах
            </button>
          </div>
        )}
      </div>
    </>
  );
}

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
  onConfirm: (method: PaymentMethod) => void;
  onLeaveQueue: () => void;
}) {
  const breakdown = pricing && values ? computePricing(pricing, values.attendees.length) : null;
  const busy = phase !== "idle";

  // Every fresh review starts on the summary, however the last one ended.
  const [transfer, setTransfer] = React.useState(false);
  const [shownFor, setShownFor] = React.useState(values);
  if (values !== shownFor) {
    setShownFor(values);
    setTransfer(false);
  }

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
            {transfer ? (
              <TransferStep
                values={values}
                breakdown={breakdown}
                phase={phase}
                queue={queue}
                onLeaveQueue={onLeaveQueue}
                onSend={() => onConfirm("transfer")}
                onBack={() => setTransfer(false)}
              />
            ) : (
              <SummaryStep
                values={values}
                breakdown={breakdown}
                phase={phase}
                queue={queue}
                onLeaveQueue={onLeaveQueue}
                onPayOnline={() => onConfirm("checkout")}
                onTransfer={() => setTransfer(true)}
                onEdit={onEdit}
              />
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
