"use client";

import { X } from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";

type Kind = "copied" | "shared" | "manual";

const COPY: Record<Kind, { gif: string; title: string; description: string }> =
  {
    copied: {
      gif: "/come/party.gif",
      title: "Холбоос хуулагдлаа!",
      description: "Найзууд руугаа чатаар явуулаарай! 💌",
    },
    shared: {
      gif: "/come/love-letter.gif",
      title: "Урилга илгээгдлээ!",
      description: "Одоо найзынхаа хариуг хүлээе 🥺",
    },
    manual: {
      gif: "/come/pleading.gif",
      title: "Автоматаар хуулж чадсангүй",
      description: "Доорх холбоосыг дараад хуулаарай",
    },
  };

function ShareToast({
  id,
  kind,
  url,
}: {
  id: string | number;
  kind: Kind;
  url: string;
}) {
  const { gif, title, description } = COPY[kind];
  const readable = decodeURI(url);

  return (
    <div className="flex w-full items-start gap-3 rounded-2xl border-2 border-[#14161A] bg-white p-3 pr-2 text-[#14161A] shadow-[4px_4px_0_#14161A] sm:w-[356px]">
      <div className="grid size-12 shrink-0 place-items-center rounded-full bg-[#F2EDE1]">
        <Image
          src={gif}
          alt=""
          width={40}
          height={40}
          unoptimized
          className="come-bob size-10"
        />
      </div>

      <div className="min-w-0 flex-1 pt-0.5">
        <p className="text-[15px] leading-tight font-black">{title}</p>
        <p className="mt-0.5 text-xs text-neutral-600">{description}</p>

        {kind === "manual" ? (
          <input
            readOnly
            value={readable}
            onClick={(e) => e.currentTarget.select()}
            aria-label="Урилгын холбоос"
            className="mt-2 w-full rounded-lg border-2 border-dashed border-[#37A8C4] bg-[#37A8C4]/10 px-2 py-1.5 font-mono text-xs outline-none"
          />
        ) : (
          <p className="mt-2 truncate rounded-lg bg-[#F2EDE1] px-2 py-1 font-mono text-[11px] text-neutral-700">
            {readable.replace(/^https?:\/\//, "")}
          </p>
        )}
      </div>

      <button
        type="button"
        onClick={() => toast.dismiss(id)}
        aria-label="Хаах"
        className="rounded-full p-1 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-[#14161A]"
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
