import { cn } from "@/lib/utils";
import * as React from "react";

export default function SocialPill({
  href,
  label,
  Icon,
}: {
  href: string;
  label: string;
  Icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
}) {
  const isExternal = href.startsWith("http");

  return (
    <a
      href={href}
      target={isExternal ? "_blank" : undefined}
      rel={isExternal ? "noreferrer" : undefined}
      aria-label={label}
      className={cn(
        "inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5",
        "px-4 py-2 text-xs font-medium text-white/75",
        "transition hover:border-white/25 hover:bg-[#F98C01] hover:text-white",
      )}
    >
      <Icon className="h-4 w-4" aria-hidden="true" />
      <span>{label}</span>
    </a>
  );
}
