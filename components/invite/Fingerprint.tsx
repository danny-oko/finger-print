import { fingerprintRidges, RIDGE_VIEWBOX } from "@/lib/invite/ridges";
import { cn } from "@/lib/utils";

export function Fingerprint({ className }: { className?: string }) {
  return (
    <svg
      viewBox={`0 0 ${RIDGE_VIEWBOX.width} ${RIDGE_VIEWBOX.height}`}
      aria-hidden
      className={cn("ridge-draw", className)}
    >
      {fingerprintRidges().map((d, i) => (
        <path
          key={i}
          d={d}
          pathLength={1}
          fill="none"
          stroke="currentColor"
          strokeWidth={3.2}
          strokeLinecap="round"
          style={{ animationDelay: `${i * 70}ms` }}
        />
      ))}
    </svg>
  );
}
