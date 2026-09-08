"use client";

import { ChevronRight, Loader2, Search, TicketCheck } from "lucide-react";
import Link from "next/link";
import * as React from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { formatGrade } from "@/lib/registration/grade";
import { formatMnt } from "@/lib/registration/pricing";

type Attendee = {
  id: string;
  full_name: string;
  grade: number | null;
  role: string;
  church_name: string;
};

type Registration = {
  id: string;
  registrant_type: string;
  payer_name: string;
  payer_phone: string;
  attendee_count: number;
  total_mnt: number;
  currency: string;
  status: "pending" | "paid" | "failed" | "expired" | "cancelled";
  tickets_issued_at: string | null;
  created_at: string;
};

type Result = Registration & { attendees: Attendee[] };

const STATUS: Record<
  Registration["status"],
  { label: string; dot: string; text: string; bg: string }
> = {
  paid: {
    label: "Төлбөр төлөгдсөн",
    dot: "bg-green-500",
    text: "text-green-800",
    bg: "bg-green-50",
  },
  pending: {
    label: "Төлбөр хүлээгдэж байна",
    dot: "bg-amber-500",
    text: "text-amber-800",
    bg: "bg-amber-50",
  },
  failed: {
    label: "Амжилтгүй",
    dot: "bg-red-500",
    text: "text-red-800",
    bg: "bg-red-50",
  },
  expired: {
    label: "Хугацаа дууссан",
    dot: "bg-neutral-400",
    text: "text-neutral-700",
    bg: "bg-neutral-100",
  },
  cancelled: {
    label: "Цуцлагдсан",
    dot: "bg-neutral-400",
    text: "text-neutral-700",
    bg: "bg-neutral-100",
  },
};

function StatusPill({ status }: { status: Registration["status"] }) {
  const s = STATUS[status];
  return (
    <span
      className={cn(
        "inline-flex w-fit shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold",
        s.bg,
        s.text,
      )}
    >
      <span className={cn("size-1.5 rounded-full", s.dot)} />
      {s.label}
    </span>
  );
}

/** 2026.09.01 — the format the site uses for the conference date itself. */
function formatDate(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}.${pad(d.getMonth() + 1)}.${pad(d.getDate())}`;
}

function ResultCard({ reg }: { reg: Result }) {
  const names = reg.attendees.map((a) => a.full_name).join(", ");
  const church = reg.attendees[0]?.church_name;

  return (
    // The whole card is the tap target — on a phone a small "details" link
    // is a needlessly precise thing to hit, and the chevron already says
    // there's somewhere to go.
    <Link
      href={`/event/registration/${reg.id}`}
      className="group grid gap-3 rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm transition-colors hover:border-[#F98C01] focus-visible:border-[#F98C01] focus-visible:outline-none"
    >
      {/* Status leads and gets its own line: it's what people came to
          check, and side by side the longer labels squeezed the name into a
          truncation. */}
      <div className="grid gap-2">
        <StatusPill status={reg.status} />
        <div className="min-w-0">
          <p className="font-bold text-neutral-900">{reg.payer_name}</p>
          <p className="text-[13px] text-neutral-500">
            {formatDate(reg.created_at)}
            {church ? ` · ${church}` : ""}
          </p>
        </div>
      </div>

      <div className="rounded-xl bg-neutral-50 p-3">
        <p className="text-[13px] font-medium text-neutral-700">
          {reg.attendee_count} хүн
        </p>
        <p className="mt-0.5 line-clamp-2 text-[13px] text-neutral-500">
          {names}
        </p>
      </div>

      {reg.status === "paid" && reg.tickets_issued_at && (
        <p className="flex items-center gap-1.5 text-[13px] font-medium text-green-700">
          <TicketCheck className="size-4" />
          QR тасалбар бэлэн — {reg.attendee_count} ширхэг
        </p>
      )}

      <div className="flex items-center justify-between border-t border-neutral-200 pt-3">
        <span className="text-lg font-black text-[#F98C01]">
          {formatMnt(reg.total_mnt)}
        </span>
        <span className="flex items-center gap-0.5 text-[13px] font-semibold text-neutral-700 group-hover:text-[#F98C01]">
          Дэлгэрэнгүй
          <ChevronRight className="size-4" />
        </span>
      </div>
    </Link>
  );
}

export function StatusLookup() {
  const [phone, setPhone] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [searchedPhone, setSearchedPhone] = React.useState<string | null>(null);
  const [results, setResults] = React.useState<Result[]>([]);
  const [error, setError] = React.useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (phone.length !== 8) return;

    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/registration/lookup?phone=${phone}`);
      const data = await res.json();
      if (!res.ok) throw new Error();
      setResults(data.registrations ?? []);
      setSearchedPhone(phone);
    } catch {
      setError("Хайлт хийхэд алдаа гарлаа. Дахин оролдоно уу.");
    } finally {
      setLoading(false);
    }
  }

  const foundNothing = searchedPhone !== null && !error && results.length === 0;

  return (
    <div className="grid gap-4">
      <form
        onSubmit={handleSubmit}
        className="grid gap-4 rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm sm:p-6"
      >
        <div className="grid gap-1">
          <h2 className="text-base font-bold tracking-tight text-neutral-900">
            Утасны дугаараар хайх
          </h2>
          <p className="text-[13px] leading-snug text-neutral-500">
            Бүртгүүлэхдээ оруулсан дугаараа бичнэ үү.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Input
            value={phone}
            onChange={(e) =>
              setPhone(e.target.value.replace(/\D/g, "").slice(0, 8))
            }
            inputMode="tel"
            maxLength={8}
            placeholder="99112233"
            aria-label="Утасны дугаар"
            className="h-12 text-base sm:flex-1"
          />
          <Button
            type="submit"
            disabled={phone.length !== 8 || loading}
            className="h-12 px-6 text-base sm:w-auto"
          >
            {loading ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Search className="size-4" />
            )}
            Хайх
          </Button>
        </div>
      </form>

      {error && (
        <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </p>
      )}

      {loading && (
        <div className="grid gap-3" aria-hidden>
          {[0, 1].map((i) => (
            <div
              key={i}
              className="h-36 animate-pulse rounded-2xl border border-neutral-200 bg-white"
            />
          ))}
        </div>
      )}

      {!loading && foundNothing && (
        <div className="grid justify-items-center gap-3 rounded-2xl border border-dashed border-neutral-300 bg-white px-5 py-8 text-center">
          <p className="font-bold text-neutral-900">
            {searchedPhone} дугаараар бүртгэл олдсонгүй
          </p>
          {/* The commonest reason by far, so it leads: a teen entered by
              their leader has no number of their own on the registration. */}
          <p className="max-w-sm text-sm text-neutral-500">
            Хэрэв таныг цуглааны ахлагч бүртгүүлсэн бол бүртгэл нь{" "}
            <span className="font-medium text-neutral-700">ахлагчийн</span>{" "}
            дугаар дээр байгаа. Ахлагчаасаа асууж үзээрэй.
          </p>
          <Button asChild variant="outline" className="mt-1 h-11">
            <Link href="/event/registration">Шинээр бүртгүүлэх</Link>
          </Button>
        </div>
      )}

      {!loading && results.length > 0 && (
        <div className="grid gap-3">
          {results.map((reg) => (
            <ResultCard key={reg.id} reg={reg} />
          ))}
        </div>
      )}

      {searchedPhone === null && !loading && (
        <div className="grid gap-2 rounded-2xl bg-neutral-100 px-5 py-4 text-[13px] leading-relaxed text-neutral-600">
          <p>
            <span className="font-semibold text-neutral-800">
              Бүртгэлээ олсны дараа
            </span>{" "}
            төлбөрийн төлөв, бүртгүүлсэн хүмүүс, төлбөр төлөгдсөн бол хүн бүрийн
            QR тасалбар харагдана.
          </p>
          <p>
            Тасалбарууд бүртгэлийн имэйл рүү мөн илгээгдсэн байгаа.
          </p>
        </div>
      )}
    </div>
  );
}
