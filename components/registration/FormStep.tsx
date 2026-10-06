import { cn } from "@/lib/utils";

export function FormStep({
  step,
  title,
  hint,
  children,
  className,
}: {
  step: number;
  title: string;
  hint?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("rounded-2xl bg-white p-5 shadow-[0_1px_2px_rgba(21,23,28,0.06)] sm:p-6", className)}>
      <div className="mb-5 flex gap-3">
        <span
          aria-hidden
          className="grid size-7 shrink-0 place-items-center rounded-full bg-ink text-[13px] font-bold text-white"
        >
          {step}
        </span>
        <div className="min-w-0 pt-0.5">
          <h2 className="text-[17px] leading-snug font-semibold text-ink">
            <span className="sr-only">{step}-р алхам. </span>
            {title}
          </h2>
          {hint && <p className="mt-1 text-sm leading-relaxed text-ink/60">{hint}</p>}
        </div>
      </div>
      {children}
    </section>
  );
}

export const FIELD_CLASS =
  "h-12 rounded-xl border-black/15 bg-white px-4 text-base shadow-none focus-visible:border-ink focus-visible:ring-ink/10 md:text-base";

export const LABEL_CLASS = "text-sm font-semibold text-ink";
