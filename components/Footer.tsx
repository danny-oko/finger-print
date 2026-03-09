"use client";

import type { FooterProps, SocialItem } from "@/lib/types";
import { useTranslation } from "@/lib/useTranslation";
import { cn } from "@/lib/utils";
import { Facebook, Instagram, Mail, Phone, Youtube } from "lucide-react";
import { useRouter } from "next/navigation";
import * as React from "react";

import FancyWords from "./FancyWords";
import SocialPill from "./SocialPill";

const CONTAINER = "mx-auto w-[min(calc(100%-2rem),80vw,1200px)]";

const SOCIAL_ITEMS: SocialItem[] = [
  { key: "instagram", label: "Instagram", Icon: Instagram },
  { key: "facebook", label: "Facebook", Icon: Facebook },
  { key: "youtube", label: "YouTube", Icon: Youtube },
  { key: "email", label: "Email", Icon: Mail },
  { key: "phone", label: "Call", Icon: Phone },
];

export default function Footer({
  className,
  bigWord = "Finger Print",
  motto = "One movement. One generation. One church family.",
  rightsText = "All rights reserved • FirstChurch",
  navItems,
  email = "hello@fingerprint.mn",
  phone = "+976 8007-0177",
  socials,
}: FooterProps) {
  const { t } = useTranslation();
  const router = useRouter();

  const resolvedNavItems = navItems ?? [
    { label: t("nav.about"), href: "#about" },
    { label: t("nav.gallery"), href: "#attend" },
    { label: t("nav.journey"), href: "#journey" },
    { label: t("nav.stories"), href: "#stories" },
  ];

  const defaultSocials = {
    instagram: "https://www.instagram.com/huruunii_hee/",
    facebook: "https://www.facebook.com/huruuniihee",
    youtube: "https://www.youtube.com",
    email: "mailto:hello@fingerprint.mn",
    phone: "tel:+976-8007-0177",
  };

  const s = socials ?? defaultSocials;

  const socialItems = SOCIAL_ITEMS.map((it) => ({
    ...it,
    href: s[it.key],
  })).filter((it): it is SocialItem & { href: string } => Boolean(it.href));

  const handleNavigate = (
    e: React.MouseEvent<HTMLAnchorElement>,
    href: string,
  ) => {
    if (!href.startsWith("#")) return;

    e.preventDefault();
    const id = href.slice(1);
    const el = document.getElementById(id);
    if (!el) return;

    router.push(href, { scroll: false });

    const NAV_OFFSET = 110;
    const y = el.getBoundingClientRect().top + window.scrollY - NAV_OFFSET;
    window.scrollTo({ top: y, behavior: "smooth" });
  };

  return (
    <footer id="footer" className={cn("w-full bg-black text-white", className)}>
      <div className={cn(CONTAINER, "py-16 md:py-20")}>
        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-black px-6 py-10 md:px-10 md:py-14">
          <div className="relative">
            <div className="grid gap-10 lg:grid-cols-[1.2fr_1fr] lg:gap-14">
              <div>
                <FancyWords text={bigWord} />

                <p className="mt-6 max-w-[52ch] text-sm leading-relaxed text-white/70 md:text-base">
                  {motto}
                </p>

                <div className="mt-8 flex flex-wrap items-center gap-3">
                  {socialItems.map(({ key, href, label, Icon }) => (
                    <SocialPill
                      key={key}
                      href={href}
                      label={label}
                      Icon={Icon}
                    />
                  ))}
                </div>
              </div>

              <div className="grid gap-8 sm:grid-cols-2">
                <div>
                  <div className="text-xs font-semibold tracking-[0.18em] text-white/55">
                    {t("footer.navigation")}
                  </div>

                  <ul className="mt-4 space-y-2.5">
                    {resolvedNavItems.map((item) => (
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
                    {t("footer.contact")}
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
