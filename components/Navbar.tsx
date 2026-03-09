"use client";

import { Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import * as React from "react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

import type { Lang } from "@/lib/translations";
import { useTranslation } from "@/lib/useTranslation";

const navConfig = [
  { key: "about" as const, href: "#about" },
  { key: "gallery" as const, href: "#attend" },
  { key: "journey" as const, href: "#journey" },
  { key: "stories" as const, href: "#stories" },
];

const LANG_LABEL: Record<Lang, string> = {
  en: "EN",
  mn: "MN",
  ko: "KR",
};

function withLang(href: string, lang: Lang) {
  const [path, hash = ""] = href.split("#");
  const u = new URL(
    path || "/",
    typeof window !== "undefined" ? window.location.origin : "http://localhost",
  );
  u.searchParams.set("lang", lang);
  return `${u.pathname}${u.search}${hash ? `#${hash}` : ""}`;
}

export default function Navbar({ className }: { className?: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const lang = (searchParams.get("lang") as Lang | null) ?? "en";
  const { t } = useTranslation();

  const setLang = (next: Lang) => {
    const current = `${pathname}${
      searchParams.toString() ? `?${searchParams.toString()}` : ""
    }`;
    router.push(withLang(current, next), { scroll: false });
  };

  const handleClickToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleNavigate = (
    e: React.MouseEvent<HTMLAnchorElement>,
    href: string,
  ) => {
    if (!href.includes("#")) return;

    e.preventDefault();

    const [, hash] = href.split("#");
    const id = hash || "";

    router.push(withLang(`#${id}`, lang), { scroll: false });

    const el = document.getElementById(id);
    if (!el) return;

    const NAV_OFFSET = 110;
    const y = el.getBoundingClientRect().top + window.scrollY - NAV_OFFSET;

    window.scrollTo({ top: y, behavior: "smooth" });
  };

  const [isMobileOpen, setIsMobileOpen] = React.useState(false);

  const handleMobileNavigate = (
    e: React.MouseEvent<HTMLAnchorElement>,
    href: string,
  ) => {
    handleNavigate(e, href);
    setIsMobileOpen(false);
  };

  React.useEffect(() => {
    if (!isMobileOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isMobileOpen]);

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsMobileOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <>
      {/* Desktop navbar */}
      <div
        className={cn("fixed inset-x-0 top-0 z-50 hidden lg:block", className)}
      >
        <div className="mx-auto w-[min(calc(100%-2rem),80vw)] max-w-[1200px] pt-4 sm:pt-6">
          <nav
            className={cn(
              "relative",
              "h-20 w-full rounded-full bg-background/90 backdrop-blur",
              "shadow-[0_18px_40px_rgba(0,0,0,0.08)]",
              "px-6 md:px-10",
              "flex items-center justify-between gap-6",
            )}
          >
            <Link
              onClick={handleClickToTop}
              href={withLang("/", lang)}
              className="flex items-center shrink-0"
            >
              <img src="/logo6.png" alt="Finger Print" className="h-8 w-auto" />
            </Link>

            <div className="absolute left-1/2 -translate-x-1/2 max-w-[55%]">
              <div className="hidden lg:flex items-center gap-8 justify-center">
                {navConfig.map((item) => (
                  <a
                    key={item.href}
                    href={withLang(item.href, lang)}
                    onClick={(e) => handleNavigate(e, item.href)}
                    className="text-sm font-medium text-foreground/80 hover:text-foreground transition"
                  >
                    {t(`nav.${item.key}`)}
                  </a>
                ))}
              </div>
            </div>

            <div className="shrink-0 flex items-center gap-2 sm:gap-3">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="secondary" className="rounded-full px-4">
                    {LANG_LABEL[lang]}
                  </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent align="end" className="min-w-[160px]">
                  {(["en", "mn", "ko"] as Lang[]).map((l) => (
                    <DropdownMenuItem key={l} onClick={() => setLang(l)}>
                      {t(`langName.${l}`)} {lang === l ? "✓" : ""}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              <Button className="rounded-full px-6 text-black" asChild>
                <Link
                  href={withLang("#footer", lang)}
                  onClick={(e) => handleNavigate(e, "#footer")}
                >
                  {t("nav.getInTouch")}
                </Link>
              </Button>
            </div>
          </nav>
        </div>
      </div>

      {/* Mobile navbar + drawer */}
      <div className={cn("fixed inset-x-0 top-0 z-50 lg:hidden", className)}>
        <div className="mx-auto w-[min(calc(100%-1.5rem),100%)] max-w-[1200px] pt-3">
          <nav className="flex h-16 items-center justify-between rounded-full bg-background/90 px-4 shadow-[0_14px_30px_rgba(0,0,0,0.18)] backdrop-blur">
            {/* LEFT: Logo */}
            <Link
              href={withLang("/", lang)}
              onClick={() => {
                setIsMobileOpen(false);
                handleClickToTop();
              }}
              className="flex items-center gap-2"
              aria-label="Home"
            >
              <img src="/logo6.png" alt="Finger Print" className="h-7 w-auto" />
            </Link>

            {/* RIGHT: Language in between + Toggle button (same position) */}
            <div className="flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="secondary"
                    className="h-9 rounded-full px-3 text-xs"
                  >
                    {LANG_LABEL[lang]}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="min-w-[160px]">
                  {(["en", "mn", "ko"] as Lang[]).map((l) => (
                    <DropdownMenuItem key={l} onClick={() => setLang(l)}>
                      {t(`langName.${l}`)} {lang === l ? "✓" : ""}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              <Button
                type="button"
                variant="secondary"
                size="icon"
                onClick={() => setIsMobileOpen((v) => !v)}
                className="h-9 w-9 rounded-full"
                aria-label={
                  isMobileOpen
                    ? "Close navigation menu"
                    : "Open navigation menu"
                }
                aria-expanded={isMobileOpen}
              >
                {isMobileOpen ? (
                  <X className="h-5 w-5" />
                ) : (
                  <Menu className="h-5 w-5" />
                )}
              </Button>
            </div>
          </nav>
        </div>

        <div
          className={cn(
            "fixed inset-0 z-60 lg:hidden",
            isMobileOpen ? "pointer-events-auto" : "pointer-events-none",
          )}
        >
          {/* Backdrop */}
          <div
            className={cn(
              "absolute inset-0 bg-black/35 backdrop-blur-[2px] transition-opacity duration-300",
              isMobileOpen ? "opacity-100" : "opacity-0",
            )}
            onClick={() => setIsMobileOpen(false)}
            aria-hidden="true"
          />

          <aside
            role="dialog"
            aria-modal="true"
            className={cn(
              "absolute right-0 top-0 h-full",
              "w-[88vw] max-w-[420px]",
              "bg-background/95 backdrop-blur-xl",
              "shadow-[0_30px_80px_rgba(0,0,0,0.28)]",
              "border-l border-border",
              "rounded-l-3xl",
              "transition-transform duration-300 ease-out",
              isMobileOpen ? "translate-x-0" : "translate-x-full",
              "flex flex-col",
            )}
          >
            <div className="px-5 pt-6 pb-4">
              <div className="flex items-center justify-between gap-3">
                <img
                  src="/logo6.png"
                  alt="Finger Print"
                  className="h-8 w-auto"
                />
                {/* Close button aligned with navbar toggle position */}
                <Button
                  type="button"
                  variant="secondary"
                  size="icon"
                  onClick={() => setIsMobileOpen(false)}
                  className="h-9 w-9 rounded-full shadow-none"
                  aria-label="Close navigation menu"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>

              <div className="mt-5 h-px w-full bg-border" />
            </div>

            <div className="flex-1 overflow-y-auto px-5 pb-6">
              <div className="space-y-2">
                {navConfig.map((item) => (
                  <a
                    key={item.href}
                    href={withLang(item.href, lang)}
                    onClick={(e) => handleMobileNavigate(e, item.href)}
                    className={cn(
                      "group flex items-center justify-between",
                      "rounded-2xl px-4 py-4",
                      "bg-muted/30 hover:bg-muted/60",
                      "active:scale-[0.99] transition",
                    )}
                  >
                    <span className="text-base font-semibold text-foreground">
                      {t(`nav.${item.key}`)}
                    </span>
                    <span className="text-sm text-muted-foreground group-hover:text-foreground/70 transition">
                      →
                    </span>
                  </a>
                ))}
              </div>
            </div>

            {/* Bottom CTA */}
            <div className="border-t border-border px-5 pt-4 pb-[calc(1rem+env(safe-area-inset-bottom))]">
              <Button className="w-full rounded-2xl py-6 text-black" asChild>
                <Link
                  href={withLang("/start", lang)}
                  onClick={() => setIsMobileOpen(false)}
                >
                  {t("nav.getInTouch")}
                </Link>
              </Button>
            </div>
          </aside>
        </div>
      </div>
    </>
  );
}
