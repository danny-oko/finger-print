import React from "react";
import { cn } from "@/lib/utils";

function SocialPill({ href, label }: { href: string; label: string }) {
  const isExternal = href.startsWith("http");
  return (
    <a
      href={href}
      target={isExternal ? "_blank" : undefined}
      rel={isExternal ? "noreferrer" : undefined}
      className={cn(
        "inline-flex items-center rounded-full border border-white/15 bg-white/5",
        "px-4 py-2 text-xs font-medium text-white/75",
        "transition hover:border-white/25 hover:bg-white/10 hover:text-white",
      )}
    >
      {label}
    </a>
  );
}
export default SocialPill;
