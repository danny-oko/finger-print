import Image from "next/image";
import Link from "next/link";

import { cn } from "@/lib/utils";

type NavLink = { href: string; label: string };

export function EventShell({
  children,
  link,
  className,
  width = "md",
}: {
  children: React.ReactNode;
  link?: NavLink;
  className?: string;
  width?: "sm" | "md";
}) {
  return (
    <div className="event-ui min-h-dvh bg-mist">
      <header className="border-b border-black/5 bg-white">
        <div
          className={cn(
            "mx-auto flex h-14 items-center justify-between gap-4 px-4",
            width === "sm" ? "max-w-md" : "max-w-2xl",
          )}
        >
          <Link href="/" className="shrink-0 rounded-md focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand">
            <Image src="/logo6.png" alt="Finger Print" width={537} height={113} priority className="h-6 w-auto" />
          </Link>
          {link && (
            <Link
              href={link.href}
              className="rounded-full px-3 py-1.5 text-sm font-medium text-ink/70 transition-colors hover:bg-mist hover:text-ink focus-visible:outline-2 focus-visible:outline-brand"
            >
              {link.label}
            </Link>
          )}
        </div>
      </header>

      <main
        className={cn(
          "mx-auto w-full px-4 pt-8 pb-16",
          width === "sm" ? "max-w-md" : "max-w-2xl",
          className,
        )}
      >
        {children}
      </main>
    </div>
  );
}

export function EventPageTitle({ title, children }: { title: string; children?: React.ReactNode }) {
  return (
    <div className="mb-8">
      <h1 className="font-display text-[1.75rem] leading-[1.15] font-bold tracking-tight text-ink sm:text-[2rem]">
        {title}
      </h1>
      {children && <div className="mt-3 max-w-prose text-[15px] leading-relaxed text-ink/70">{children}</div>}
    </div>
  );
}
