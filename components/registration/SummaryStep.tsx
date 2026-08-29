"use client";

import { useFormContext } from "react-hook-form";

import { Card, CardContent } from "@/components/ui/card";
import { computePricing, formatMnt, type PricingSettings } from "@/lib/registration/pricing";
import type { RegistrationFormValues } from "@/lib/registration/schema";

export function SummaryStep({ pricing }: { pricing: PricingSettings | null }) {
  const { watch } = useFormContext<RegistrationFormValues>();
  const registrantType = watch("registrantType");
  const attendees = watch("attendees");
  const payerName = watch("payerName");
  const payerPhone = watch("payerPhone");
  const payerEmail = watch("payerEmail");

  const names = attendees
    .map((a) => a.fullName)
    .filter(Boolean)
    .join(", ");

  const breakdown = pricing ? computePricing(pricing, attendees.length) : null;

  return (
    <div className="grid gap-4">
      <Card className="border-neutral-200">
        <CardContent className="grid gap-3 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Бүртгүүлэгчийн төрөл</span>
            <span className="font-medium">
              {registrantType === "church_leader"
                ? "Сүмийн ахлагч (олноор)"
                : "Хувиараа бүртгүүлэгч"}
            </span>
          </div>
          {registrantType === "church_leader" && (
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Холбоо барих хүн</span>
              <span className="font-medium">
                {payerName} · {payerPhone}
              </span>
            </div>
          )}
          <div className="flex items-start justify-between gap-4">
            <span className="text-muted-foreground shrink-0">Бүртгүүлж буй хүмүүс</span>
            <span className="text-right font-medium">{names || "—"}</span>
          </div>
          <div className="flex items-center justify-between gap-4 border-t border-neutral-200 pt-3">
            <span className="text-muted-foreground shrink-0">Тасалбар очих имэйл</span>
            <span className="text-right font-medium">{payerEmail || "—"}</span>
          </div>
        </CardContent>
      </Card>

      <Card className="border-neutral-200">
        <CardContent className="grid gap-2 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">
              Бүртгэлийн хураамж ({attendees.length} хүн ×{" "}
              {breakdown ? formatMnt(breakdown.pricePerAttendeeMnt) : "—"})
            </span>
            <span className="font-medium">{breakdown ? formatMnt(breakdown.subtotalMnt) : "—"}</span>
          </div>
          {breakdown && breakdown.taxMnt > 0 && (
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Татвар ({breakdown.taxRatePercent}%)</span>
              <span className="font-medium">{formatMnt(breakdown.taxMnt)}</span>
            </div>
          )}
          <div className="mt-2 flex items-center justify-between border-t border-neutral-200 pt-3 text-base">
            <span className="font-bold">Нийт төлөх дүн</span>
            <span className="font-black text-[#F98C01]">
              {breakdown ? formatMnt(breakdown.totalMnt) : "Тооцоолж байна..."}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
