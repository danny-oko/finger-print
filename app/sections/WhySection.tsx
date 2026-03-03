"use client";

import * as React from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/lib/useTranslation";
import { GrainGradient } from "@paper-design/shaders-react";
import { Badge } from "@/components/ui/badge";

const CONTAINER = "mx-auto w-[min(calc(100%-2rem),80vw,1200px)]";

export default function WhySection({
  className,
  label,
  main,
  clarify,
}: {
  className?: string;
  label?: string;
  main?: string;
  clarify?: string;
}) {
  const { t } = useTranslation();
  const labelText = label ?? t("identity.label");
  const mainText = main ?? t("identity.main");
  const clarifyText = clarify ?? t("identity.clarify");
  const sectionRef = React.useRef<HTMLElement | null>(null);
  const pinRef = React.useRef<HTMLDivElement | null>(null);
  const clarifyRef = React.useRef<HTMLParagraphElement | null>(null);
  const pillsRef = React.useRef<HTMLDivElement | null>(null);
  const mainRef = React.useRef<HTMLParagraphElement | null>(null);

  React.useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const section = sectionRef.current;
    const pin = pinRef.current;
    const clarifyEl = clarifyRef.current;
    const pillsEl = pillsRef.current;
    const mainEl = mainRef.current;
    if (!section || !pin || !clarifyEl || !pillsEl || !mainEl) return;

    const ctx = gsap.context(() => {
      gsap.set(clarifyEl, { opacity: 0, y: 18 });
      gsap.set(pillsEl.children, {
        opacity: 0,
        y: 10,
        rotate: -2,
        scale: 0.98,
      });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: "+=140%",
          scrub: 1,
          pin: pin,
          anticipatePin: 1,
        },
      });

      tl.to(mainEl, { opacity: 0.94, duration: 0.2 }, 0)
        .to(
          clarifyEl,
          { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" },
          0.25,
        )
        .to(
          pillsEl.children,
          {
            opacity: 1,
            y: 0,
            rotate: 0,
            scale: 1,
            stagger: 0.08,
            duration: 0.5,
            ease: "power2.out",
          },
          0.35,
        );
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className={cn("w-full", className)}>
      <GrainGradient
        colors={["#F5F1E8", "#F5F1E8"]}
        noise={0.15}
        softness={0.4}
        intensity={0.2}
        speed={0}
      />
      <div
        ref={pinRef}
        className="relative w-full overflow-hidden bg-white text-neutral-900"
      >
        <div className={cn(CONTAINER, "py-24 md:py-28")}>
          <Badge
            variant="primary"
            className=" rounded-full px-5 py-2 text-sm text-black tracking-normal "
          >
            {labelText}
          </Badge>
          <p
            ref={mainRef}
            className="mt-10 text-pretty text-[clamp(34px,4.6vw,64px)] font-semibold leading-[1.06] tracking-tight text-neutral-900"
          >
            {mainText}
          </p>

          <p
            ref={clarifyRef}
            className="mt-10 max-w-[68ch] text-pretty text-lg font-medium leading-relaxed text-neutral-900/70 md:text-xl"
          >
            {clarifyText}
          </p>

          <div ref={pillsRef} className="mt-10 flex flex-wrap gap-3">
            <span className="inline-flex items-center rounded-2xl bg-emerald-400 px-5 py-3 text-sm font-semibold text-black shadow-[0_16px_34px_rgba(0,0,0,.14)]">
              {t("identity.pillIdentity")}
            </span>
            <span className="inline-flex items-center rounded-2xl bg-violet-200 px-5 py-3 text-sm font-semibold text-black shadow-[0_16px_34px_rgba(0,0,0,.14)]">
              {t("identity.pillUnity")}
            </span>
            <span className="inline-flex items-center rounded-2xl bg-orange-400 px-5 py-3 text-sm font-semibold text-black shadow-[0_16px_34px_rgba(0,0,0,.14)]">
              {t("identity.pillNextGen")}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
