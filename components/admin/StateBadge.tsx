import { STATE_CLASS, STATE_LABEL, type MonitorState } from "@/lib/admin/monitor";
import { cn } from "@/lib/utils";

export function StateBadge({
  state,
  className,
}: {
  state: MonitorState;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center rounded-full border px-2 py-0.5 text-[11px] font-semibold whitespace-nowrap",
        STATE_CLASS[state],
        className,
      )}
    >
      {STATE_LABEL[state]}
    </span>
  );
}
