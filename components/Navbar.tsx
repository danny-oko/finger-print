// app/components/Navbar.tsx
"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import StaggeredMenu from "@/components/StaggeredMenu";

const navItems = [
  { label: "About", href: "#about" },
  { label: "Journey", href: "#journey" },
  { label: "Stories", href: "#stories" },
  { label: "Gallery", href: "#gallery" },
];

const socialItems = [
  { label: "Instagram", link: "https://www.instagram.com/huruunii_hee/" },
  { label: "Facebook", link: "https://www.facebook.com/huruuniihee" },
  { label: "YouTube", link: "https://www.youtube.com" },
  { label: "Gmail", link: "mailto:hello@fingerprint.mn" },
  { label: "Tel", link: "tel:+97699112233" },
];

type Lang = "en" | "mn" | "ko";

const LANG_LABEL: Record<Lang, string> = {
  en: "EN",
  mn: "MN",
  ko: "KR",
};

const LANG_NAME: Record<Lang, string> = {
  en: "English",
  mn: "Монгол",
  ko: "한국어",
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

  const setLang = (next: Lang) => {
    const current = `${pathname}${searchParams.toString() ? `?${searchParams.toString()}` : ""}`;
    router.push(withLang(current, next), { scroll: false });
  };

  const menuItems = [
    { label: "Home", ariaLabel: "Go to home page", link: withLang("/", lang) },
    {
      label: "About",
      ariaLabel: "Learn about us",
      link: withLang("#about", lang),
    },
    {
      label: "Our Vision",
      ariaLabel: "Our vision",
      link: withLang("#our-vision", lang),
    },
    {
      label: "Impacts",
      ariaLabel: "View impacts",
      link: withLang("#impact", lang),
    },
    {
      label: "Contact",
      ariaLabel: "Get in touch",
      link: withLang("/start", lang),
    },
  ];

  const handleClickToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleNavigate = (
    e: React.MouseEvent<HTMLAnchorElement>,
    href: string,
  ) => {
    // only handle hash links
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

  return (
    <>
      {/* <div className={cn("fixed inset-0 z-50 md:hidden", className)}>
        <StaggeredMenu
          position="right"
          items={menuItems}
          socialItems={socialItems}
          displaySocials
          displayItemNumbering
          menuButtonColor="#bbb5b5"
          openMenuButtonColor="#111111"
          changeMenuColorOnOpen
          colors={["#f5f5f5", "#e5e5e5"]}
          logoUrl="/logo.png"
          accentColor="#111111"
          isFixed
          closeOnClickAway
          className="z-1"
        />
      </div> */}

      <div
        className={cn("fixed inset-x-0 top-0 z-50 hidden md:block", className)}
      >
        <div className="mx-auto w-[min(calc(100%-2rem),80vw)] max-w-[1280px] pt-4 sm:pt-6">
          <nav
            className={cn(
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
              <img src="/logo.png" alt="Finger Print" className="h-8 w-auto" />
            </Link>

            <div className="hidden md:flex items-center gap-10 flex-1 justify-center">
              {navItems.map((item) => {
                const link = withLang(item.href, lang);
                return (
                  <a
                    key={item.href}
                    href={link}
                    onClick={(e) => handleNavigate(e, item.href)}
                    className="text-sm font-medium text-foreground/80 hover:text-foreground transition"
                  >
                    {item.label}
                  </a>
                );
              })}
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
                      {LANG_NAME[l]} {lang === l ? "✓" : ""}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              <Button className="rounded-full px-6" asChild>
                <Link href={withLang("/start", lang)}>Get In Touch</Link>
              </Button>
            </div>
          </nav>
        </div>
      </div>
    </>
  );
}
