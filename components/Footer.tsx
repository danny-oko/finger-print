// components/Footer.tsx
import Link from "next/link";
import { cn } from "@/lib/utils";

const CONTAINER = "mx-auto w-[min(80vw,1200px)]";

type Props = {
  className?: string;
  bigWord?: string;
  motto?: string;
  rightsText?: string;
  nav?: { label: string; href: string }[];
  email?: string;
  phone?: string;
};

export default function Footer({
  className,
  bigWord = "Finger Print",
  motto = "One movement. One generation. One church family.",
  rightsText = "All rights reserved • FirstChurch",
  nav = [
    { label: "About", href: "#about" },
    { label: "Our Vision", href: "#our-vision" },
    { label: "Impacts", href: "#pricing" },
    { label: "Get In Touch", href: "/start" },
  ],
  email = "hello@fingerprint.mn",
  phone = "+976 0000-0000",
}: Props) {
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
                  <SocialPill
                    href="https://www.instagram.com/huruunii_hee/"
                    label="Instagram"
                  />
                  <SocialPill
                    href="https://www.facebook.com/huruuniihee"
                    label="Facebook"
                  />
                  <SocialPill href="https://www.youtube.com" label="YouTube" />
                  <SocialPill
                    href="mailto:hello@fingerprint.mn"
                    label="Gmail"
                  />
                  <SocialPill href="tel:+97600000000" label="Tel" />
                </div>
              </div>

              <div className="grid gap-8 sm:grid-cols-2">
                <div>
                  <div className="text-xs font-semibold tracking-[0.18em] text-white/55">
                    NAVIGATION
                  </div>

                  <ul className="mt-4 space-y-2.5">
                    {nav.map((n) => (
                      <li key={n.href}>
                        {n.href.startsWith("#") ? (
                          <a
                            href={n.href}
                            className="text-sm text-white/75 transition hover:text-white"
                          >
                            {n.label}
                          </a>
                        ) : (
                          <Link
                            href={n.href}
                            className="text-sm text-white/75 transition hover:text-white"
                          >
                            {n.label}
                          </Link>
                        )}
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

                    <div className="pt-3 text-xs text-white/50">
                      {rightsText}
                    </div>
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
        <span
          className={cn(
            "bg-gradient-to-r from-white via-white to-white/70 bg-clip-text text-transparent",
          )}
        >
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
