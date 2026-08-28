import { Check } from "lucide-react";

import { cn } from "@/lib/utils";

export function Stepper({
  labels,
  currentIndex,
}: {
  labels: string[];
  currentIndex: number;
}) {
  return (
    <ol className="flex w-full items-center gap-1 sm:gap-2">
      {labels.map((label, index) => {
        const isDone = index < currentIndex;
        const isCurrent = index === currentIndex;

        return (
          <li key={label} className="flex flex-1 items-center gap-1 sm:gap-2">
            <div className="flex flex-1 flex-col items-center gap-1.5">
              <div
                className={cn(
                  "flex size-7 shrink-0 items-center justify-center rounded-full border text-xs font-bold transition-colors sm:size-8",
                  isDone && "border-[#F98C01] bg-[#F98C01] text-black",
                  isCurrent && "border-[#F98C01] text-[#F98C01]",
                  !isDone && !isCurrent && "border-neutral-300 text-neutral-400",
                )}
              >
                {isDone ? <Check className="size-4" /> : index + 1}
              </div>
              <span
                className={cn(
                  "hidden text-center text-[11px] font-medium leading-tight sm:block",
                  isCurrent ? "text-black" : "text-neutral-400",
                )}
              >
                {label}
              </span>
            </div>
            {index < labels.length - 1 && (
              <div
                className={cn(
                  "h-0.5 flex-1 rounded-full transition-colors",
                  isDone ? "bg-[#F98C01]" : "bg-neutral-200",
                )}
              />
            )}
          </li>
        );
      })}
    </ol>
  );
}
