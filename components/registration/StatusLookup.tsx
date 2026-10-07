"use client";

import {
  AlertCircle,
  CheckCircle2,
  Clock,
  Landmark,
  Loader2,
  Search,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import * as React from "react";

import { errorCodeFrom, userMessage, type AppErrorCode } from "@/lib/errors";
import { formatGrade } from "@/lib/registration/grade";
import type { LookupRegistration } from "@/lib/registration/lookup";
import { formatMnt } from "@/lib/registration/pricing";
import { cn } from "@/lib/utils";

type Tone = "good" | "wait" | "bad";

const TONE: Record<Tone, string> = {
  good: "text-emerald-700",
  wait: "text-amber-700",
  bad: "text-red-700",
};

function describe(reg: LookupRegistration) {
  if (reg.status === "paid") {
    return {
      tone: "good" as Tone,
      Icon: CheckCircle2,
      title: reg.invited ? "Урилгаар бүртгэгдсэн" : "Төлбөр төлөгдсөн",
      body: "Тасалбар бэлэн. Чуулганы өдөр QR-аа хаалган дээр үзүүлнэ.",
      action: `Тасалбар харах${reg.attendeeCount > 1 ? ` (${reg.attendeeCount})` : ""}`,
    };
  }
  if (reg.status === "pending" && reg.awaitingVerification) {
    return {
      tone: "wait" as Tone,
      Icon: Landmark,
      title: "Шилжүүлгийг шалгаж байна",
      body: "Ажилтан дансаа шалгаж байна. Баталгаажмагц тасалбар тань энд гарна.",
      action: "Дэлгэрэнгүй",
    };
  }
  if (reg.status === "pending") {
    return {
      tone: "wait" as Tone,
      Icon: Clock,
      title: "Төлбөр төлөгдөөгүй",
      body: "Бүртгэл хадгалагдсан ч төлбөр хараахан ороогүй байна.",
      action: "Төлбөрөө төлөх",
    };
  }
  if (reg.status === "cancelled" && reg.awaitingVerification) {
    return {
      tone: "bad" as Tone,
      Icon: XCircle,
      title: "Шилжүүлэг баталгаажсангүй",
      body: "Шилжүүлэг дансанд орсон нь олдоогүй. Шилжүүлсэн бол зохион байгуулагчтай холбогдоно уу.",
      action: "Дэлгэрэнгүй",
    };
  }
  return {
    tone: "bad" as Tone,
    Icon: XCircle,
    title:
      reg.status === "expired"
        ? "Хугацаа дууссан"
        : reg.status === "cancelled"
          ? "Цуцлагдсан"
          : "Төлбөр амжилтгүй",
    body: "Энэ бүртгэлээр орох боломжгүй. Оролцох бол шинээр бүртгүүлнэ үү.",
    action: "Дэлгэрэнгүй",
  };
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}.${pad(d.getMonth() + 1)}.${pad(d.getDate())}`;
}

const VISIBLE_NAMES = 6;

function ResultCard({ reg }: { reg: LookupRegistration }) {
  const { tone, Icon, title, body, action } = describe(reg);
  const church = reg.attendees[0]?.churchName;
  const hidden = reg.attendees.length - VISIBLE_NAMES;

  return (
    <article className="rounded-2xl bg-white p-5 shadow-[0_1px_2px_rgba(21,23,28,0.06)] sm:p-6">
      <div className="flex items-start gap-3">
        <Icon className={cn("mt-0.5 size-6 shrink-0", TONE[tone])} />
        <div className="min-w-0">
          <h3 className={cn("text-[17px] font-semibold", TONE[tone])}>{title}</h3>
          <p className="mt-1 text-[15px] leading-relaxed text-ink/70">{body}</p>
        </div>
      </div>

      <dl className="mt-5 grid gap-1.5 border-t border-black/5 pt-4 text-[15px]">
        <div className="flex justify-between gap-4">
          <dt className="text-ink/60">Бүртгүүлсэн</dt>
          <dd className="text-right font-medium">
            {reg.payerName}, {formatDate(reg.createdAt)}
          </dd>
        </div>
        {church && (
          <div className="flex justify-between gap-4">
            <dt className="text-ink/60">Цуглаан</dt>
            <dd className="text-right font-medium">{church}</dd>
          </div>
        )}
        {!reg.invited && (
          <div className="flex justify-between gap-4">
            <dt className="text-ink/60">Төлбөр</dt>
            <dd className="text-right font-medium tabular-nums">{formatMnt(reg.totalMnt)}</dd>
          </div>
        )}
      </dl>

      <ul className="mt-4 grid gap-1.5" aria-label="Оролцогчид">
        {reg.attendees.slice(0, VISIBLE_NAMES).map((a) => (
          <li key={a.id} className="flex items-center justify-between gap-3 rounded-xl bg-mist px-3.5 py-2.5">
            <span className="min-w-0 truncate font-medium">{a.fullName}</span>
            <span className="shrink-0 text-sm text-ink/60">
              {a.checkedIn ? "Ирсэн" : formatGrade(a)}
            </span>
          </li>
        ))}
        {hidden > 0 && <li className="px-3.5 text-sm text-ink/60">бас {hidden} хүн</li>}
      </ul>

      <Link
        href={`/event/registration/${reg.id}`}
        className={cn(
          "mt-5 flex h-12 items-center justify-center rounded-full text-base font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink",
          reg.status === "paid" || (reg.status === "pending" && !reg.awaitingVerification)
            ? "bg-brand text-ink hover:bg-brand-strong"
            : "border border-black/15 text-ink hover:bg-mist",
        )}
      >
        {action}
      </Link>
    </article>
  );
}

// Paid registrations first: that's what people are looking for, and an old
// abandoned attempt above a valid ticket reads as "something went wrong".
const ORDER: Record<string, number> = { paid: 0, pending: 1 };

export function StatusLookup() {
  const [phone, setPhone] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [searched, setSearched] = React.useState<string | null>(null);
  const [results, setResults] = React.useState<LookupRegistration[]>([]);
  const [error, setError] = React.useState<AppErrorCode | null>(null);
  const lastAsked = React.useRef<string | null>(null);

  const search = React.useCallback(async (value: string) => {
    if (!/^[5-9]\d{7}$/.test(value) || lastAsked.current === value) return;
    lastAsked.current = value;

    setLoading(true);
    setError(null);
    setResults([]);
    setSearched(null);

    try {
      const res = await fetch(`/api/registration/lookup?phone=${value}`);
      if (!res.ok) {
        setError(await errorCodeFrom(res));
        lastAsked.current = null;
        return;
      }
      const data = (await res.json()) as { registrations?: LookupRegistration[] };
      setResults(
        [...(data.registrations ?? [])].sort((a, b) => (ORDER[a.status] ?? 2) - (ORDER[b.status] ?? 2)),
      );
      setSearched(value);
    } catch {
      // Only a request that never completed lands here — the connection,
      // not the registration.
      setError("network_error");
      lastAsked.current = null;
    } finally {
      setLoading(false);
    }
  }, []);

  const invalidStart = phone.length > 0 && !/^[5-9]/.test(phone);

  return (
    <div className="grid gap-4">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          lastAsked.current = null;
          void search(phone);
        }}
        className="rounded-2xl bg-white p-5 shadow-[0_1px_2px_rgba(21,23,28,0.06)] sm:p-6"
      >
        <label htmlFor="lookup-phone" className="text-sm font-semibold text-ink">
          Утасны дугаар
        </label>
        <div className="mt-2 flex gap-2">
          <div className="flex h-13 min-w-0 flex-1 items-center rounded-xl border border-black/15 bg-white focus-within:border-ink focus-within:ring-[3px] focus-within:ring-ink/10">
            <span className="pl-4 text-base text-ink/50 select-none">+976</span>
            <input
              id="lookup-phone"
              value={phone}
              onChange={(e) => {
                const next = e.target.value.replace(/\D/g, "").slice(-8);
                setPhone(next);
                // Eight digits is a whole number — no need to make anyone
                // find the button.
                if (next.length === 8) void search(next);
              }}
              type="tel"
              inputMode="numeric"
              autoComplete="tel-national"
              placeholder="9911 2233"
              aria-describedby="lookup-hint"
              aria-invalid={invalidStart || undefined}
              className="h-full w-0 min-w-0 flex-1 bg-transparent px-3 text-lg tracking-wide tabular-nums outline-none placeholder:text-ink/30"
            />
          </div>
          <button
            type="submit"
            disabled={phone.length !== 8 || loading}
            className="flex h-13 shrink-0 items-center gap-2 rounded-xl bg-ink px-5 text-base font-semibold text-white transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink disabled:opacity-40"
          >
            {loading ? <Loader2 className="size-5 animate-spin" /> : <Search className="size-5" />}
            <span className="max-[359px]:sr-only">Хайх</span>
          </button>
        </div>
        <p id="lookup-hint" className={cn("mt-3 text-sm leading-relaxed", invalidStart ? "text-red-700" : "text-ink/60")}>
          {invalidStart
            ? "Монгол гар утасны дугаар 5–9-өөр эхэлнэ."
            : "Ахлагч тань таныг бүлгээр бүртгүүлсэн бол ахлагчийнхаа дугаараар хайна уу."}
        </p>
      </form>

      {error && (
        <div role="alert" className="flex gap-3 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-red-900">
          <AlertCircle className="mt-0.5 size-5 shrink-0" />
          <div>
            <p className="font-semibold">{userMessage(error).title}</p>
            {userMessage(error).hint && <p className="mt-1 text-sm">{userMessage(error).hint}</p>}
          </div>
        </div>
      )}

      {loading && (
        <div className="grid gap-3" aria-hidden>
          <div className="h-64 animate-pulse rounded-2xl bg-white" />
        </div>
      )}

      {!loading && searched && results.length === 0 && !error && (
        <div className="rounded-2xl bg-white p-6 shadow-[0_1px_2px_rgba(21,23,28,0.06)]">
          <h2 className="text-[17px] font-semibold">{searched} дугаараар бүртгэл олдсонгүй</h2>
          <ul className="mt-3 grid list-disc gap-1.5 pl-5 text-[15px] leading-relaxed text-ink/70">
            <li>Ахлагч тань бүртгүүлсэн бол бүртгэл нь ахлагчийн дугаар дээр байгаа.</li>
            <li>Өөр дугаараар бүртгүүлсэн байж магадгүй — нөгөө дугаараа оруулж үзээрэй.</li>
          </ul>
          <Link
            href="/event/registration"
            className="mt-5 flex h-12 items-center justify-center rounded-full border border-black/15 text-base font-semibold hover:bg-mist focus-visible:outline-2 focus-visible:outline-ink"
          >
            Шинээр бүртгүүлэх
          </Link>
        </div>
      )}

      {!loading && results.length > 0 && (
        <section className="grid gap-3" aria-live="polite">
          <h2 className="px-1 text-sm font-medium text-ink/60">
            {searched} дугаар дээр {results.length} бүртгэл олдлоо
          </h2>
          {results.map((reg) => (
            <ResultCard key={reg.id} reg={reg} />
          ))}
        </section>
      )}
    </div>
  );
}
