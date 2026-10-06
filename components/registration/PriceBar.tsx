"use client";

import { ArrowRight } from "lucide-react";

import { computePricing, formatMnt, type PricingSettings } from "@/lib/registration/pricing";
import { cn } from "@/lib/utils";

export function PriceBar({
  pricing,
  attendeeCount,
  disabled,
  label = "Шалгаад төлөх",
}: {
  pricing: PricingSettings | null;
  attendeeCount: number;
  disabled?: boolean;
  label?: string;
}) {
  const breakdown = pricing ? computePricing(pricing, attendeeCount) : null;

  return (
    <div className="sticky bottom-0 z-10 mt-6 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
      <div className="flex items-center justify-between gap-4 rounded-3xl border border-black/[0.06] bg-white/95 py-3 pr-3 pl-6 shadow-[0_8px_30px_rgba(21,23,28,0.10)] backdrop-blur supports-[backdrop-filter]:bg-white/85">
        <div className="min-w-0" aria-live="polite">
          <p className="text-[13px] whitespace-nowrap text-ink/55">
            {attendeeCount} хүн
            {breakdown && <> × {formatMnt(breakdown.pricePerAttendeeMnt)}</>}
          </p>
          <p className="mt-0.5 text-xl leading-tight font-semibold tracking-tight text-ink tabular-nums">
            {breakdown ? formatMnt(breakdown.totalMnt) : "…"}
          </p>
        </div>

        <button
          type="submit"
          disabled={disabled}
          className={cn(
            "inline-flex h-12 shrink-0 items-center gap-2 rounded-full bg-ink px-6 text-[15px] font-semibold text-white transition-colors",
            "hover:bg-ink/85 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink",
            "disabled:cursor-not-allowed disabled:bg-black/10 disabled:text-ink/40",
          )}
        >
          {label}
          <ArrowRight className="size-4" />
        </button>
      </div>
    </div>
  );
}
