"use client";

import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Copy,
  Landmark,
  Printer,
  Search,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import * as React from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { clearRegistrationDraft } from "@/hooks/use-registration-draft";
import type { RegistrationDetail as Detail } from "@/lib/registration/detail";
import { formatGrade } from "@/lib/registration/grade";
import { formatMnt } from "@/lib/registration/pricing";
import { cn } from "@/lib/utils";

const POLL_INTERVAL_MS = 3000;
const MAX_POLLS = 20;
const EVENT_LINE = "2026.10.10 · Хурууны хээ";

// Pinned to Ulaanbaatar and assembled by hand. Locale formatting differs
// between the server's ICU and the browser's, which made this row a
// hydration mismatch; the conference is in Mongolia, so its clock is also
// the only one worth showing.
const UB_PARTS = new Intl.DateTimeFormat("en-CA", {
  timeZone: "Asia/Ulaanbaatar",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

function formatDateTime(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";

  const part = Object.fromEntries(
    UB_PARTS.formatToParts(date).map((p) => [p.type, p.value]),
  );

  return `${part.year}.${part.month}.${part.day} ${part.hour}:${part.minute}`;
}

/**
 * One attendee's stub. The dashed line is the fold a real ticket has: above
 * it is who this is, below it is what gets scanned at the door. The card
 * fills whatever height the screen gave it and the QR takes the slack, so
 * the code is as large as the phone allows without the page ever scrolling.
 */
function Ticket({ attendee }: { attendee: Detail["attendees"][number] }) {
  return (
    <article className="flex h-full max-h-[30rem] w-full shrink-0 snap-center flex-col self-center overflow-hidden rounded-3xl bg-neutral-900 print:h-auto print:break-inside-avoid print:border print:border-neutral-300">
      <div className="shrink-0 px-6 pt-5 pb-4 text-center">
        <p className="text-[11px] font-semibold tracking-wide text-[#F98C01]">
          {EVENT_LINE}
        </p>
        <p className="mt-1.5 text-lg leading-tight font-bold text-balance text-white">
          {attendee.fullName}
        </p>
        <p className="mt-0.5 text-xs text-neutral-400">
          {formatGrade(attendee)} · {attendee.churchName}
        </p>
      </div>

      <div className="relative shrink-0" aria-hidden>
        <div className="mx-6 border-t border-dashed border-neutral-700" />
        {/* Punched out of both edges, in the page's own colour — the notch is
            what makes the dashed line read as a tear-off rather than a rule. */}
        <span className="absolute top-1/2 -left-2.5 size-5 -translate-y-1/2 rounded-full bg-neutral-50" />
        <span className="absolute top-1/2 -right-2.5 size-5 -translate-y-1/2 rounded-full bg-neutral-50" />
      </div>

      {/* The QR takes the slack the screen has left, up to a cap — big enough
          to scan across a doorway, never so big it swallows the stub. */}
      <div className="flex min-h-0 flex-1 items-center justify-center px-6 pt-5">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`/api/registration/tickets/${attendee.ticketCode}/qr`}
          alt={`QR тасалбар ${attendee.ticketCode}`}
          width={320}
          height={320}
          className="h-full max-h-72 w-auto max-w-full rounded-xl bg-white object-contain p-2.5 print:h-44"
        />
      </div>

      <div className="grid shrink-0 justify-items-center gap-2 px-6 pt-3 pb-5">
        <p className="font-mono text-lg font-bold tracking-[0.15em] text-[#F98C01]">
          {attendee.ticketCode}
        </p>
        {attendee.checkedIn && (
          <p className="rounded-full bg-emerald-500/15 px-3 py-1 text-[11px] font-semibold text-emerald-400">
            Ирсэн бүртгэл хийгдсэн
          </p>
        )}
      </div>
    </article>
  );
}

/** The paid page: one ticket per attendee, swiped through in place. */
function TicketDeck({
  attendees,
  onCurrentChange,
}: {
  attendees: Detail["attendees"][number][];
  onCurrentChange: (index: number) => void;
}) {
  const trackRef = React.useRef<HTMLDivElement>(null);
  const [index, setIndex] = React.useState(0);

  function handleScroll() {
    const track = trackRef.current;
    if (!track) return;
    const next = Math.round(track.scrollLeft / track.clientWidth);
    if (next === index) return;
    setIndex(next);
    onCurrentChange(next);
  }

  function goTo(next: number) {
    const track = trackRef.current;
    if (!track) return;

    // Assigning scrollLeft always moves the track; the animation comes from
    // the `scroll-smooth` class, which degrades to an instant jump rather
    // than to nothing. The index is set here too so the counter is right
    // even where the scroll event is throttled.
    track.scrollLeft = next * track.clientWidth;
    setIndex(next);
    onCurrentChange(next);
  }

  const many = attendees.length > 1;

  return (
    <>
      <div
        ref={trackRef}
        onScroll={handleScroll}
        className={cn(
          "flex min-h-0 flex-1 scroll-smooth snap-x snap-mandatory overflow-x-auto overflow-y-hidden",
          "[-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
          "print:block print:overflow-visible",
        )}
      >
        {attendees.map((attendee) => (
          <Ticket key={attendee.id} attendee={attendee} />
        ))}
      </div>

      {many && (
        <div className="flex shrink-0 items-center justify-center gap-3 pt-3 print:hidden">
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label="Өмнөх тасалбар"
            disabled={index === 0}
            onClick={() => goTo(index - 1)}
          >
            <ChevronLeft className="size-4" />
          </Button>
          <p className="text-xs font-medium tabular-nums text-neutral-500">
            {index + 1} / {attendees.length}
          </p>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label="Дараагийн тасалбар"
            disabled={index === attendees.length - 1}
            onClick={() => goTo(index + 1)}
          >
            <ChevronRight className="size-4" />
          </Button>
        </div>
      )}
    </>
  );
}

function Receipt({ detail }: { detail: Detail }) {
  return (
    <details className="group text-left print:open">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 rounded-xl px-1 py-2 text-xs text-neutral-500 marker:hidden hover:text-neutral-900">
        <span>Төлбөрийн мэдээлэл</span>
        <span className="font-bold text-neutral-900">
          {formatMnt(detail.totalMnt)}
        </span>
      </summary>

      <dl className="grid gap-1.5 px-1 pt-2 pb-1 text-xs">
        <div className="flex justify-between gap-4">
          <dt className="text-neutral-500">Бүртгүүлсэн</dt>
          <dd className="font-medium">{formatDateTime(detail.createdAt)}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-neutral-500">Бүртгэлийн төрөл</dt>
          <dd className="font-medium">
            {detail.registrantType === "church_leader"
              ? "Сүмийн ахлагчаар"
              : "Хувиараа"}
          </dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-neutral-500">Холбоо барих</dt>
          <dd className="text-right font-medium">
            {detail.payerName}
            <span className="block text-neutral-400">
              {detail.payerPhoneMasked}
              {detail.payerEmailMasked ? ` · ${detail.payerEmailMasked}` : ""}
            </span>
          </dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-neutral-500">
            {detail.attendeeCount} хүн × {formatMnt(detail.pricePerAttendeeMnt)}
          </dt>
          <dd className="font-bold text-[#F98C01]">
            {formatMnt(detail.totalMnt)}
          </dd>
        </div>
        <p className="pt-1 font-mono text-[10px] break-all text-neutral-300">
          {detail.id}
        </p>
      </dl>
    </details>
  );
}

/** Everything that isn't a paid ticket: waiting, verifying, or failed. */
function StatusPanel({ detail }: { detail: Detail }) {
  const panel = (() => {
    if (detail.status === "pending" && detail.awaitingVerification) {
      return {
        icon: <Landmark className="size-12 text-sky-600" />,
        title: "Шилжүүлгийг шалгаж байна",
        body: "Таны банкны шилжүүлгийг хүлээн авлаа. Зохион байгуулагч баталгаажуулмагц тасалбар энэ хуудсанд гарч ирнэ — холбоосоо хадгална уу.",
      };
    }

    if (detail.status === "pending") {
      return {
        icon: <Clock className="size-12 animate-pulse text-[#F98C01]" />,
        title: "Төлбөрийг баталгаажуулж байна…",
        body: "Хэдхэн секунд хүлээнэ үү. Төлбөр амжилттай хийсэн бол энэ хуудас автоматаар шинэчлэгдэнэ.",
      };
    }

    return {
      icon: <XCircle className="size-12 text-destructive" />,
      title:
        detail.status === "expired"
          ? "Төлбөрийн хугацаа дууссан"
          : "Төлбөр амжилтгүй боллоо",
      body: "Бүртгэл хадгалагдсан ч төлбөр хийгдээгүй байна. Дахин бүртгүүлж үзнэ үү.",
      action: (
        <Button asChild className="mt-2 h-11">
          <Link href="/event/registration">Дахин бүртгүүлэх</Link>
        </Button>
      ),
    };
  })();

  return (
    <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-2 text-center">
      {panel.icon}
      <h1 className="text-xl font-black text-neutral-900">{panel.title}</h1>
      <p className="max-w-sm text-sm text-balance text-muted-foreground">
        {panel.body}
      </p>
      {panel.action}

      <ul className="mt-5 grid max-h-40 w-full max-w-xs gap-1.5 overflow-y-auto text-left">
        {detail.attendees.map((attendee) => (
          <li
            key={attendee.id}
            className="flex items-baseline justify-between gap-3 rounded-xl border border-neutral-200 bg-white px-3 py-2"
          >
            <span className="text-sm font-medium text-neutral-900">
              {attendee.fullName}
            </span>
            <span className="text-[11px] text-neutral-400">
              {formatGrade(attendee)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function RegistrationDetail({ initial }: { initial: Detail }) {
  const [detail, setDetail] = React.useState(initial);
  const [current, setCurrent] = React.useState(0);
  const [polls, setPolls] = React.useState(0);

  // The registration is paid for and the tickets are on this page, so the
  // saved form draft has done its job. This is the only place it's dropped —
  // an unpaid registration leaves it alone so the form still remembers.
  React.useEffect(() => {
    if (detail.status === "paid") clearRegistrationDraft();
  }, [detail.status]);

  // Right after checkout the webhook usually hasn't landed yet, so a pending
  // registration re-checks itself for about a minute rather than making the
  // registrant reload the page by hand.
  React.useEffect(() => {
    if (detail.status !== "pending") return;

    let cancelled = false;

    const timer = setTimeout(async () => {
      if (cancelled) return;
      setPolls((count) => count + 1);

      try {
        const res = await fetch(`/api/registration/${detail.id}`, {
          cache: "no-store",
        });
        if (!res.ok) return;
        const data = (await res.json()) as { registration: Detail };
        if (!cancelled) setDetail(data.registration);
      } catch {
        // A failed poll is not worth surfacing — the next tick retries.
      }
    }, POLL_INTERVAL_MS);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [detail]);

  const paid = detail.status === "paid";
  const stillWaiting =
    detail.status === "pending" &&
    !detail.awaitingVerification &&
    polls >= MAX_POLLS;

  const currentTicket = detail.attendees[current]?.ticketCode;

  async function copyTicketLink() {
    if (!currentTicket) return;
    try {
      await navigator.clipboard.writeText(
        `${window.location.origin}/event/ticket/${currentTicket}`,
      );
      toast.success("Тасалбарын холбоос хуулагдлаа");
    } catch {
      toast.error("Хуулж чадсангүй");
    }
  }

  return (
    <div className="flex h-[90dvh] max-h-full w-full max-w-sm flex-col print:h-auto print:max-h-none">
      {paid ? (
        <>
          <header className="shrink-0 pb-4 text-center">
            <p className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-emerald-700">
              <CheckCircle2 className="size-4" />
              Төлбөр амжилттай
            </p>
            <p className="mt-0.5 text-xs text-neutral-500">
              {detail.attendeeCount} хүний бүртгэл баталгаажлаа. Энэ QR-ийг
              хаалган дээр харуулна уу.
            </p>
          </header>

          <TicketDeck
            attendees={detail.attendees}
            onCurrentChange={setCurrent}
          />

          <footer className="shrink-0 pt-4">
            <div className="flex items-center justify-center gap-1 print:hidden">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={copyTicketLink}
                disabled={!currentTicket}
              >
                <Copy className="size-3.5" />
                Холбоос хуулах
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => window.print()}
              >
                <Printer className="size-3.5" />
                Хэвлэх
              </Button>
              <Button asChild variant="ghost" size="sm">
                <Link href="/event/status">
                  <Search className="size-3.5" />
                  Өөр бүртгэл
                </Link>
              </Button>
            </div>

            <div className="mt-1 border-t border-neutral-200 pt-1">
              <Receipt detail={detail} />
            </div>
          </footer>
        </>
      ) : (
        <>
          <StatusPanel detail={detail} />

          {stillWaiting && (
            <p className="mt-4 shrink-0 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-center text-xs text-amber-800">
              Төлбөр удаж байна. Төлбөрөө хийсэн бол хэдхэн минутын дараа энэ
              хуудсыг дахин ачаална уу, эсвэл зохион байгуулагчтай холбогдоно уу.
            </p>
          )}

          <footer className="shrink-0 pt-4">
            <div className="flex justify-center print:hidden">
              <Button asChild variant="ghost" size="sm">
                <Link href="/event/status">
                  <Search className="size-3.5" />
                  Өөр бүртгэл шалгах
                </Link>
              </Button>
            </div>
            <div className="mt-1 border-t border-neutral-200 pt-1">
              <Receipt detail={detail} />
            </div>
          </footer>
        </>
      )}
    </div>
  );
}
