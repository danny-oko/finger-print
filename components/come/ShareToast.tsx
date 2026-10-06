"use client";

import { Check, Link2, X } from "lucide-react";
import { toast } from "sonner";

type Kind = "copied" | "shared" | "manual";

const COPY: Record<Kind, { title: string; description: string }> = {
  copied: { title: "Холбоос хуулагдлаа", description: "Найз руугаа чатаар илгээгээрэй." },
  shared: { title: "Урилга илгээгдлээ", description: "Найз тань холбоосоор орж бүртгүүлнэ." },
  manual: { title: "Автоматаар хуулж чадсангүй", description: "Доорх холбоосыг дарж хуулна уу." },
};

function ShareToast({ id, kind, url }: { id: string | number; kind: Kind; url: string }) {
  const { title, description } = COPY[kind];
  const readable = decodeURI(url);
  const Icon = kind === "manual" ? Link2 : Check;

  return (
    <div className="event-ui flex w-full items-start gap-3 rounded-2xl bg-white p-4 pr-2 shadow-lg ring-1 ring-black/5 sm:w-[356px]">
      <span className="grid size-9 shrink-0 place-items-center rounded-full bg-mist">
        <Icon className="size-4 text-ink" />
      </span>

      <div className="min-w-0 flex-1">
        <p className="text-[15px] font-semibold">{title}</p>
        <p className="mt-0.5 text-sm text-ink/60">{description}</p>

        {kind === "manual" ? (
          <input
            readOnly
            value={readable}
            onClick={(e) => e.currentTarget.select()}
            aria-label="Урилгын холбоос"
            className="mt-2 w-full rounded-lg border border-black/15 bg-mist px-2 py-1.5 text-sm outline-none"
          />
        ) : (
          <p className="mt-2 truncate rounded-lg bg-mist px-2 py-1 text-[13px] text-ink/70">
            {readable.replace(/^https?:\/\//, "")}
          </p>
        )}
      </div>

      <button
        type="button"
        onClick={() => toast.dismiss(id)}
        aria-label="Хаах"
        className="rounded-full p-1 text-ink/40 hover:bg-mist hover:text-ink"
      >
        <X className="size-4" />
      </button>
    </div>
  );
}

export function showShareToast(kind: Kind, url: string) {
  toast.custom((id) => <ShareToast id={id} kind={kind} url={url} />, {
    // Long enough to actually copy the link by hand when the clipboard failed.
    duration: kind === "manual" ? 15000 : 4000,
  });
}
