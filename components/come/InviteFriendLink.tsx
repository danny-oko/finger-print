"use client";

import { MailPlus } from "lucide-react";
import Link from "next/link";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useTranslation } from "@/lib/useTranslation";
import { cn } from "@/lib/utils";

export function InviteFriendLink({
  className,
  onClick,
  tooltipSide = "top",
}: {
  className?: string;
  onClick?: () => void;
  tooltipSide?: "top" | "bottom";
}) {
  const { t } = useTranslation();
  const label = t("register.inviteFriend");

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Link
            href="/come"
            onClick={onClick}
            aria-label={label}
            className={cn(
              "inline-flex shrink-0 items-center justify-center rounded-full transition hover:scale-105 active:scale-95",
              className,
            )}
          >
            <MailPlus className="size-[50%]" strokeWidth={2} />
          </Link>
        </TooltipTrigger>
        <TooltipContent side={tooltipSide} sideOffset={6}>{label}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
