"use client";

import { Badge } from "@/components/ui/badge";
import { useTranslation } from "@/lib/useTranslation";
import { cn } from "@/lib/utils";
import { GrainGradient } from "@paper-design/shaders-react";

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

  return (
    <section className={cn("h-[90vh] w-full", className)}>
      <GrainGradient
        colors={["#F5F1E8", "#F5F1E8"]}
        noise={0.15}
        softness={0.4}
        intensity={0.2}
        speed={0}
      />

      <div className="relative w-full overflow-hidden bg-white text-neutral-900">
        <div className={cn(CONTAINER, "py-24 md:py-28")}>
          <Badge
            variant="primary"
            className="rounded-full px-5 py-2 text-sm tracking-normal text-black"
          >
            {labelText}
          </Badge>

          <p className="mt-10 text-pretty text-[clamp(28px,4vw,64px)] font-semibold leading-[1.06] tracking-tight text-neutral-900">
            {mainText}
          </p>

          <p className="mt-10 max-w-[68ch] text-pretty text-lg font-medium leading-relaxed text-neutral-900/70 md:text-xl">
            {clarifyText}
          </p>
        </div>
      </div>
    </section>
  );
}
