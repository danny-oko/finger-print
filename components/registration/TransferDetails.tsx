"use client";

import { Check, Copy } from "lucide-react";
import * as React from "react";
import { toast } from "sonner";

import { formatMnt } from "@/lib/registration/pricing";
import { TRANSFER_ACCOUNT } from "@/lib/registration/transfer";
import { cn } from "@/lib/utils";

function CopyButton({ value, label }: { value: string; label: string }) {
  const [copied, setCopied] = React.useState(false);

  React.useEffect(() => {
    if (!copied) return;
    const timer = setTimeout(() => setCopied(false), 1500);
    return () => clearTimeout(timer);
  }, [copied]);

  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      toast.success(`${label} хуулагдлаа`);
    } catch {
      toast.error("Хуулж чадсангүй — гараараа бичнэ үү");
    }
  }

  return (
    <button
      type="button"
      onClick={copy}
      aria-label={`${label} хуулах`}
      className="grid size-11 shrink-0 place-items-center rounded-xl bg-ink text-white transition-colors hover:bg-ink/85 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
    >
      {copied ? <Check className="size-5" /> : <Copy className="size-5" />}
    </button>
  );
}

function CopyRow({
  label,
  value,
  copyValue = value,
  note,
  mono,
  onWhite,
}: {
  label: string;
  value: string;
  copyValue?: string;
  note?: string;
  mono?: boolean;
  onWhite: boolean;
}) {
  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-2xl px-4 py-3.5",
        onWhite ? "bg-mist" : "border border-black/[0.06] bg-white",
      )}
    >
      <div className="min-w-0 flex-1">
        <p className="text-[13px] text-ink/55">{label}</p>
        <p
          className={cn(
            "mt-1 font-semibold break-words text-ink",
            mono ? "font-mono text-[17px] tracking-wide tabular-nums" : "text-[15px]",
          )}
        >
          {value}
        </p>
        {note && <p className="mt-0.5 text-[13px] text-ink/55">{note}</p>}
      </div>
      <CopyButton value={copyValue} label={label} />
    </div>
  );
}

export function TransferDetails({
  totalMnt,
  reference,
  onWhite = true,
}: {
  totalMnt: number | null;
  reference?: string;
  onWhite?: boolean;
}) {
  return (
    <div className="grid gap-2.5">
      <CopyRow
        label="Дансны дугаар (IBAN)"
        value={TRANSFER_ACCOUNT.iban}
        note={TRANSFER_ACCOUNT.bank}
        mono
        onWhite={onWhite}
      />
      {reference && <CopyRow label="Гүйлгээний утга" value={reference} onWhite={onWhite} />}
      {totalMnt !== null && (
        <CopyRow
          label="Шилжүүлэх дүн"
          value={formatMnt(totalMnt)}
          copyValue={String(totalMnt)}
          onWhite={onWhite}
        />
      )}
    </div>
  );
}
