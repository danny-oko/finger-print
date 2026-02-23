"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useRouter } from "next/navigation";

const CONTAINER = "mx-auto w-[min(calc(100%-2rem),80vw,1200px)]";

type Socials = {
  youtube?: string;
  facebook?: string;
  instagram?: string;
  email?: string;
  phone?: string;
};

type Props = {
  className?: string;
  bigWord?: string;
  motto?: string;
  rightsText?: string;
  navItems?: { label: string; href: string }[];
  email?: string;
  phone?: string;
  socials?: Socials;
};

function withLang(href: string, lang: string) {
  const [path, hash = ""] = href.split("#");
  const u = new URL(
    path || "/",
    typeof window !== "undefined" ? window.location.origin : "http://localhost",
  );
  u.searchParams.set("lang", lang);
  return `${u.pathname}${u.search}${hash ? `#${hash}` : ""}`;
}

export default function Footer({
  className,
  bigWord = "Finger Print",
  motto = "One movement. One generation. One church family.",
  rightsText = "All rights reserved • FirstChurch",
  navItems = [
    { label: "About", href: "#about" },
    { label: "Journey", href: "#journey" },
    { label: "Stories", href: "#stories" },
    { label: "Gallery", href: "#gallery" },
  ],
  email = "hello@fingerprint.mn",
  phone = "+976 8007-0177",
  socials,
}: Props) {
  const defaultSocials: Socials = {
    instagram: "https://www.instagram.com/huruunii_hee/",
    facebook: "https://www.facebook.com/huruuniihee",
    youtube: "https://www.youtube.com",
    email: "mailto:hello@fingerprint.mn",
    phone: "tel:+97680070177",
  };
  const s = socials ?? defaultSocials;

  const router = useRouter();

  const handleNavigate = (
    e: React.MouseEvent<HTMLAnchorElement>,
    href: string,
  ) => {
    if (!href.startsWith("#")) return;

    e.preventDefault();

    const id = href.slice(1);
    const el = document.getElementById(id);
    if (!el) return;

    // keep URL hash updated (optional but nice)
    router.push(href, { scroll: false });

    const NAV_OFFSET = 110; // adjust for your fixed navbar height
    const y = el.getBoundingClientRect().top + window.scrollY - NAV_OFFSET;

    window.scrollTo({ top: y, behavior: "smooth" });
  };

  return (
    <footer className={cn("w-full bg-black text-white", className)}>
      <div className={cn(CONTAINER, "py-16 md:py-20")}>
        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-black px-6 py-10 md:px-10 md:py-14">
          <div className="pointer-events-none absolute inset-0 opacity-80">
            <div className="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
            <div className="absolute -right-24 -bottom-24 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
          </div>

          <div className="relative">
            <div className="grid gap-10 lg:grid-cols-[1.2fr_1fr] lg:gap-14">
              <div>
                <FancyWord text={bigWord} />

                <p className="mt-6 max-w-[52ch] text-sm leading-relaxed text-white/70 md:text-base">
                  {motto}
                </p>

                <div className="mt-8 flex flex-wrap items-center gap-3">
                  {s.instagram && (
                    <SocialPill href={s.instagram} label="Instagram" />
                  )}
                  {s.facebook && (
                    <SocialPill href={s.facebook} label="Facebook" />
                  )}
                  {s.youtube && <SocialPill href={s.youtube} label="YouTube" />}
                  {s.email && <SocialPill href={s.email} label="Gmail" />}
                  {s.phone && <SocialPill href={s.phone} label="Tel" />}
                </div>
              </div>

              <div className="grid gap-8 sm:grid-cols-2">
                <div>
                  <div className="text-xs font-semibold tracking-[0.18em] text-white/55">
                    NAVIGATION
                  </div>

                  <ul className="mt-4 space-y-2.5">
                    {navItems.map((item) => (
                      <li key={item.href}>
                        <a
                          href={item.href}
                          onClick={(e) => handleNavigate(e, item.href)}
                          className="block text-sm font-medium text-white/75 transition hover:text-white"
                        >
                          {item.label}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <div className="text-xs font-semibold tracking-[0.18em] text-white/55">
                    CONTACT
                  </div>

                  <div className="mt-4 space-y-2.5">
                    <a
                      href={`mailto:${email}`}
                      className="block text-sm text-white/75 transition hover:text-white"
                    >
                      {email}
                    </a>
                    <a
                      href={`tel:${phone.replace(/\s/g, "")}`}
                      className="block text-sm text-white/75 transition hover:text-white"
                    >
                      {phone}
                    </a>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-12 flex flex-col gap-3 border-t border-white/10 pt-6 md:flex-row md:items-center md:justify-between">
              <div className="text-xs text-white/55">
                © {new Date().getFullYear()} {bigWord}
              </div>
              <div className="text-xs text-white/55">{rightsText}</div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FancyWord({ text }: { text: string }) {
  return (
    <div className="relative">
      <div
        aria-hidden
        className={cn(
          "select-none",
          "text-[clamp(52px,7vw,110px)] font-black leading-[0.9] tracking-tight",
          "text-white/10 blur-[0.2px]",
          "absolute -left-1 -top-1 rotate-[-2deg]",
        )}
      >
        {text}
      </div>

      <h2
        className={cn(
          "relative",
          "text-[clamp(52px,7vw,110px)] font-black leading-[0.9] tracking-tight",
          "rotate-[-2deg]",
        )}
      >
        <span className="bg-gradient-to-r from-white via-white to-white/70 bg-clip-text text-transparent">
          {text}
        </span>
        <span
          aria-hidden
          className={cn(
            "absolute inset-0",
            "text-transparent",
            "[text-stroke:1px_rgba(255,255,255,0.18)]",
            "[-webkit-text-stroke:1px_rgba(255,255,255,0.18)]",
          )}
        >
          {text}
        </span>
      </h2>
    </div>
  );
}

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
