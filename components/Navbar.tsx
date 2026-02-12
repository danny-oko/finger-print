// app/components/Navbar.tsx
"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const navItems = [
  { label: "About", href: "#about" },
  { label: "Features", href: "#features" },
  { label: "Pricing", href: "#pricing" },
];

export default function Navbar({ className }: { className?: string }) {
  return (
    <div className={cn("fixed inset-x-0 top-0 z-50 ", className)}>
      <div className="mx-auto w-[min(1200px,92vw)] pt-6">
        <nav
          className={cn(
            "h-20 w-full rounded-full bg-background/90 backdrop-blur",
            "shadow-[0_18px_40px_rgba(0,0,0,0.08)]",
            "px-6 md:px-10",
            "flex items-center justify-between gap-6",
          )}
        >
          {/* Logo */}
          <Link href="/" className="flex items-center shrink-0">
            <img src="/logo.png" alt="Finger Print" className="h-8 w-auto" />
          </Link>

          {/* Links */}
          <div className="hidden md:flex items-center gap-10 flex-1 justify-center">
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="text-sm font-medium text-foreground/80 hover:text-foreground transition"
              >
                {item.label}
              </a>
            ))}
          </div>

          {/* CTA */}
          <div className="shrink-0">
            <Button className="rounded-full px-6" asChild>
              <Link href="/start">Get In Touch</Link>
            </Button>
          </div>
        </nav>
      </div>
    </div>
  );
}
