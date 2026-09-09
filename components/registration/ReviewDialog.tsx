"use client";

import { Landmark, Loader2, Pencil } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatGrade, toGradeColumns } from "@/lib/registration/grade";
import {
  computePricing,
  formatMnt,
  type PricingSettings,
} from "@/lib/registration/pricing";
import type {
  PaymentMethod,
  RegistrationFormOutput,
} from "@/lib/registration/schema";

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 text-sm">
      <span className="shrink-0 text-neutral-500">{label}</span>
      <span className="text-right font-medium text-neutral-900">{value}</span>
    </div>
  );
}

export function ReviewDialog({
  values,
  pricing,
  submitting,
  onEdit,
  onConfirm,
}: {
  values: RegistrationFormOutput | null;
  pricing: PricingSettings | null;
  submitting: PaymentMethod | null;
  onEdit: () => void;
  onConfirm: (method: PaymentMethod) => void;
}) {
  const breakdown =
    pricing && values ? computePricing(pricing, values.attendees.length) : null;
  const isGroup = (values?.attendees.length ?? 0) > 1;

  return (
    <Dialog
      open={values !== null}
      onOpenChange={(open) => {
        if (!open && !submitting) onEdit();
      }}
    >
      <DialogContent
        showCloseButton={!submitting}
        className="max-h-[90dvh] gap-0 overflow-hidden p-0 sm:max-w-lg"
      >
        {values && (
          <>
            <DialogHeader className="px-6 pt-6 pb-4 text-left">
              <DialogTitle className="text-xl font-black">
                Хурууны Хээ - Онлайн бүртгэл
              </DialogTitle>
              <DialogDescription>
                Төлбөр төлөхийн өмнө мэдээллээ шалгана уу. Буруу бол засаж
                болно.
              </DialogDescription>
            </DialogHeader>

            <div className="grid max-h-[50dvh] gap-5 overflow-y-auto border-y border-neutral-200 bg-neutral-50 px-6 py-5">
              <div className="grid gap-2">
                <Row label="Цуглаан" value={values.churchName} />
                {isGroup && (
                  <Row
                    label="Бүртгэж буй хүн"
                    value={`${values.payerName} · ${values.payerPhone}`}
                  />
                )}
              </div>

              <ol className="grid gap-2">
                {values.attendees.map((a, i) => (
                  <li
                    key={`${a.fullName}-${i}`}
                    className="flex items-start justify-between gap-3 rounded-xl bg-white px-3 py-2.5"
                  >
                    <span className="flex min-w-0 items-baseline gap-2">
                      <span className="text-[13px] font-bold text-neutral-400">
                        {i + 1}
                      </span>
                      <span className="min-w-0">
                        <span className="block truncate font-medium text-neutral-900">
                          {a.fullName}
                        </span>
                        <span className="block text-[13px] text-neutral-500">
                          {formatGrade(toGradeColumns(a.grade))}
                          {a.phone ? ` · ${a.phone}` : ""}
                        </span>
                      </span>
                    </span>
                    <span className="shrink-0 text-[13px] font-medium text-neutral-500">
                      {breakdown
                        ? formatMnt(breakdown.pricePerAttendeeMnt)
                        : ""}
                    </span>
                  </li>
                ))}
              </ol>
            </div>

            <div className="grid gap-2 px-6 py-4">
              <Row
                label={`${values.attendees.length} хүн × ${
                  breakdown ? formatMnt(breakdown.pricePerAttendeeMnt) : "—"
                }`}
                value={breakdown ? formatMnt(breakdown.subtotalMnt) : "—"}
              />
              {breakdown && breakdown.taxMnt > 0 && (
                <Row
                  label={`Татвар (${breakdown.taxRatePercent}%)`}
                  value={formatMnt(breakdown.taxMnt)}
                />
              )}
              <div className="flex items-center justify-between border-t border-neutral-200 pt-3">
                <span className="font-bold text-neutral-900">Нийт төлөх</span>
                <span className="text-xl font-black text-[#F98C01]">
                  {breakdown ? formatMnt(breakdown.totalMnt) : "—"}
                </span>
              </div>
            </div>

            {/* Card/QPay leads because it's the one that confirms itself and
                returns the payer to their tickets. Bank transfer is the
                deliberate second choice: it's what a church leader collecting
                cash from a group actually needs. */}
            <DialogFooter className="flex flex-col gap-2 px-6 pb-6 sm:flex-col">
              <Button
                type="button"
                className="h-12 text-base"
                onClick={() => onConfirm("checkout")}
                disabled={submitting !== null}
              >
                <Landmark className="size-4" />
                {submitting === "checkout" ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                  </>
                ) : (
                  "Төлбөр төлөх"
                )}
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="h-11"
                onClick={onEdit}
                disabled={submitting !== null}
              >
                <Pencil className="size-4" />
                {submitting ? "Түр хүлээнэ үү..." : "Мэдээлэл засах"}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
