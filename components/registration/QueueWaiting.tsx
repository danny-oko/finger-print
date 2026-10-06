"use client";

import { Loader2 } from "lucide-react";

import type { QueueView } from "@/hooks/use-queue-pass";

function formatEta(seconds: number): string {
  if (seconds < 60) return "1 минут хүрэхгүй";
  return `ойролцоогоор ${Math.round(seconds / 60)} минут`;
}

export function QueueWaiting({ view, onLeave }: { view: QueueView; onLeave: () => void }) {
  if (view.phase === "joining") {
    return (
      <div className="flex items-center justify-center gap-2 py-6 text-sm text-ink/60" role="status">
        <Loader2 className="size-4 animate-spin" />
        Ээлж авч байна…
      </div>
    );
  }

  if (view.phase !== "waiting") return null;

  const ahead = Math.max(0, view.position - 1);
  const progress = view.total > 0 ? Math.max(0.06, 1 - ahead / Math.max(view.total, ahead + 1)) : 0;

  return (
    <div className="grid gap-4 py-2" role="status" aria-live="polite">
      <div>
        <p className="text-sm font-medium text-ink/60">Олон хүн зэрэг бүртгүүлж байна</p>
        <p className="mt-1 text-2xl font-bold text-ink tabular-nums">
          {ahead === 0 ? "Дараагийнх нь та" : `Таны өмнө ${ahead} хүн`}
        </p>
        <p className="mt-1 text-sm text-ink/60">Хүлээх хугацаа {formatEta(view.etaSec)}.</p>
      </div>

      <div className="h-2 overflow-hidden rounded-full bg-mist">
        <div
          className="h-full rounded-full bg-brand transition-[width] duration-700"
          style={{ width: `${progress * 100}%` }}
        />
      </div>

      <p className="rounded-xl bg-mist px-4 py-3 text-sm leading-relaxed text-ink/70">
        Энэ цонхыг хаалгүй хүлээнэ үү. Ээлж ирэхэд төлбөрийн хуудас автоматаар нээгдэнэ.
        Бөглөсөн мэдээлэл тань хадгалагдсан.
      </p>

      <button
        type="button"
        onClick={onLeave}
        className="h-11 rounded-full text-sm font-semibold text-ink/70 hover:bg-mist focus-visible:outline-2 focus-visible:outline-ink"
      >
        Дараалалаас гарах
      </button>
    </div>
  );
}
