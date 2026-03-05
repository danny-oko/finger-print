// app/components/MobileNavbar.tsx
"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Lang } from "@/lib/translations";
import { useTranslation } from "@/lib/useTranslation";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import * as React from "react";

const navConfig = [
  { key: "about" as const, href: "#about" },
  { key: "journey" as const, href: "#journey" },
  { key: "stories" as const, href: "#stories" },
  { key: "gallery" as const, href: "#gallery" },
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

function BurgerIcon({ open }: { open: boolean }) {
  return (
    <span className="relative block h-5 w-6">
      <span
        className={cn(
          "absolute left-0 top-[2px] h-[2px] w-6 rounded-full bg-foreground transition-transform duration-300",
          open ? "translate-y-[8px] rotate-45" : "",
        )}
      />
      <span
        className={cn(
          "absolute left-0 top-[9px] h-[2px] w-6 rounded-full bg-foreground transition-all duration-300",
          open ? "opacity-0" : "opacity-100",
        )}
      />
      <span
        className={cn(
          "absolute left-0 top-[16px] h-[2px] w-6 rounded-full bg-foreground transition-transform duration-300",
          open ? "translate-y-[-8px] -rotate-45" : "",
        )}
      />
    </span>
  );
}

export default function MobileNavbar({ className }: { className?: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { t } = useTranslation();

  const lang = (searchParams.get("lang") as Lang | null) ?? "en";

  const setLang = (next: Lang) => {
    const current = `${pathname}${
      searchParams.toString() ? `?${searchParams.toString()}` : ""
    }`;
    router.push(withLang(current, next), { scroll: false });
  };

  const [open, setOpen] = React.useState(false);

  // lock body scroll when open
  React.useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  // close on ESC
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const handleClickToTop = () => {
    setOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const scrollToId = (id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    const NAV_OFFSET = 90;
    const y = el.getBoundingClientRect().top + window.scrollY - NAV_OFFSET;
    window.scrollTo({ top: y, behavior: "smooth" });
  };

  const handleNavigate = (
    e: React.MouseEvent<HTMLAnchorElement>,
    href: string,
  ) => {
    if (!href.includes("#")) return;

    e.preventDefault();

    const [, hash] = href.split("#");
    const id = hash || "";
    setOpen(false);

    // keep lang in url
    router.push(withLang(`#${id}`, lang), { scroll: false });

    // wait a tick so layout is stable
    requestAnimationFrame(() => scrollToId(id));
  };

  return (
    <div className={cn("fixed inset-x-0 top-0 z-50 md:hidden", className)}>
      <div className="mx-auto w-[min(calc(100%-2rem),92vw)] max-w-[1200px] pt-3">
        <nav
          className={cn(
            "h-16 w-full rounded-full bg-background/90 backdrop-blur",
            "shadow-[0_18px_40px_rgba(0,0,0,0.08)]",
            "px-4",
            "flex items-center justify-between",
          )}
        >
          <Link
            onClick={handleClickToTop}
            href={withLang("/", lang)}
            className="flex items-center gap-2 shrink-0"
          >
            <img src="/logo6.png" alt="Finger Print" className="h-7 w-auto" />
          </Link>

          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="secondary" className="rounded-full px-3">
                  {LANG_LABEL[lang]}
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end" className="min-w-[160px]">
                {(["en", "mn", "ko"] as Lang[]).map((l) => (
                  <DropdownMenuItem
                    key={l}
                    onClick={() => {
                      setLang(l);
                      // keep menu state
                    }}
                  >
                    {t(`langName.${l}`)} {lang === l ? "✓" : ""}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <Button
              variant="secondary"
              className="rounded-full px-3"
              onClick={() => setOpen((v) => !v)}
              aria-label={open ? "Close menu" : "Open menu"}
              aria-expanded={open}
            >
              <BurgerIcon open={open} />
            </Button>
          </div>
        </nav>
      </div>

      {/* Overlay */}
      <div
        className={cn(
          "fixed inset-0 z-50",
          open ? "pointer-events-auto" : "pointer-events-none",
        )}
        aria-hidden={!open}
      >
        <div
          className={cn(
            "absolute inset-0 bg-black/40 transition-opacity duration-300",
            open ? "opacity-100" : "opacity-0",
          )}
          onClick={() => setOpen(false)}
        />

        {/* Left drawer */}
        <aside
          className={cn(
            "absolute left-0 top-0 h-full w-[86vw] max-w-[360px]",
            "bg-background shadow-2xl",
            "transition-transform duration-300 ease-out",
            open ? "translate-x-0" : "-translate-x-full",
            "flex flex-col",
          )}
          role="dialog"
          aria-modal="true"
        >
          <div className="flex items-center justify-between px-5 py-5">
            <Link
              href={withLang("/", lang)}
              onClick={() => {
                setOpen(false);
                requestAnimationFrame(() =>
                  window.scrollTo({ top: 0, behavior: "smooth" }),
                );
              }}
              className="flex items-center gap-2"
            >
              <img src="/logo6.png" alt="Finger Print" className="h-8 w-auto" />
            </Link>

            <Button
              variant="secondary"
              className="rounded-full px-3"
              onClick={() => setOpen(false)}
              aria-label="Close menu"
            >
              <BurgerIcon open />
            </Button>
          </div>

          <div className="px-5">
            <div className="h-px w-full bg-border" />
          </div>

          <div className="flex-1 overflow-y-auto px-5 py-4">
            <div className="flex flex-col gap-2">
              {navConfig.map((item) => (
                <a
                  key={item.href}
                  href={withLang(item.href, lang)}
                  onClick={(e) => handleNavigate(e, item.href)}
                  className={cn(
                    "rounded-2xl px-4 py-3",
                    "text-base font-semibold text-foreground",
                    "bg-muted/40 hover:bg-muted transition",
                  )}
                >
                  {t(`nav.${item.key}`)}
                </a>
              ))}
            </div>

            <div className="mt-5">
              <Button className="w-full rounded-2xl px-6 text-black" asChild>
                <Link
                  href={withLang("/start", lang)}
                  onClick={() => setOpen(false)}
                >
                  {t("nav.getInTouch")}
                </Link>
              </Button>
            </div>
          </div>

          <div className="px-5 pb-5 text-xs text-muted-foreground">
            © Finger Print
          </div>
        </aside>
      </div>
    </div>
  );
}
