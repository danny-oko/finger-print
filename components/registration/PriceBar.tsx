"use client";

import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  computePricing,
  formatMnt,
  type PricingSettings,
} from "@/lib/registration/pricing";

/**
 * The old flow put the total on its own review step, which meant the price
 * only appeared after every decision that changed it. Here it sits above the
 * pay button the whole time, so the number moves as people are added.
 */
export function PriceBar({
  pricing,
  attendeeCount,
  submitting,
}: {
  pricing: PricingSettings | null;
  attendeeCount: number;
  submitting: boolean;
}) {
  const breakdown = pricing ? computePricing(pricing, attendeeCount) : null;

  return (
    <div className="sticky bottom-0 -mx-4 border-t border-neutral-200 bg-white/95 px-5 py-4 backdrop-blur supports-[backdrop-filter]:bg-white/85">
      <div className="mx-auto flex w-full max-w-2xl items-center justify-between gap-4">
        <div className="min-w-0">
          <p className="text-[13px] text-neutral-500">
            {attendeeCount} хүн ×{" "}
            {breakdown ? formatMnt(breakdown.pricePerAttendeeMnt) : "—"}
            {breakdown && breakdown.taxMnt > 0 && (
              <> · Татвар {formatMnt(breakdown.taxMnt)}</>
            )}
          </p>
          <p className="text-xl font-black leading-tight text-[#F98C01]">
            {breakdown ? formatMnt(breakdown.totalMnt) : "Тооцоолж байна..."}
          </p>
        </div>

        <Button
          type="submit"
          size="lg"
          disabled={submitting}
          className="h-12 min-w-36 shrink-0 text-base"
        >
          {submitting ? (
            <>
              <Loader2 className="size-4 animate-spin" /> Түр хүлээнэ үү...
            </>
          ) : (
            "Төлбөр төлөх"
          )}
        </Button>
      </div>
    </div>
  );
}
