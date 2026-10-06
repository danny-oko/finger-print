"use client";

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
    <div className="sticky bottom-0 z-10 -mx-4 mt-6 border-t border-black/10 bg-white/95 px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur supports-[backdrop-filter]:bg-white/85">
      <div className="mx-auto flex w-full max-w-2xl items-center justify-between gap-4">
        <div className="min-w-0" aria-live="polite">
          <p className="text-sm text-ink/60">
            {attendeeCount} хүн
            {breakdown && <> × {formatMnt(breakdown.pricePerAttendeeMnt)}</>}
          </p>
          <p className="text-xl leading-tight font-bold text-ink tabular-nums">
            {breakdown ? formatMnt(breakdown.totalMnt) : "…"}
          </p>
        </div>

        <button
          type="submit"
          disabled={disabled}
          className={cn(
            "h-12 shrink-0 rounded-full bg-brand px-6 text-base font-semibold text-ink transition-colors",
            "hover:bg-brand-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink",
            "disabled:cursor-not-allowed disabled:bg-black/10 disabled:text-ink/40",
          )}
        >
          {label}
        </button>
      </div>
    </div>
  );
}
