"use client";

import Link from "next/link";

import { trackEvent } from "@/lib/analytics/client";
import { cn } from "@/lib/utils";

export function RegisterLink({ className }: { className?: string }) {
  return (
    <Link
      href="/event/registration"
      onClick={() => trackEvent("come_register_clicked", {})}
      className={cn(
        "flex h-13 items-center justify-center rounded-full bg-ink text-base font-semibold text-white transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink",
        className,
      )}
    >
      Бүртгүүлэх
    </Link>
  );
}
