"use client";

import {
  CheckCircle2,
  Clock,
  Copy,
  Landmark,
  Printer,
  Search,
  XCircle,
} from "lucide-react";
import * as React from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { RegistrationDetail as Detail } from "@/lib/registration/detail";
import { formatMnt } from "@/lib/registration/pricing";
import { cn } from "@/lib/utils";

const POLL_INTERVAL_MS = 3000;
const MAX_POLLS = 20;

function formatDateTime(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";
  return `${date.toLocaleDateString("mn-MN")} ${date.toLocaleTimeString("mn-MN", {
    hour: "2-digit",
    minute: "2-digit",
  })}`;
}

function StatusHero({ detail }: { detail: Detail }) {
  if (detail.status === "paid") {
    return (
      <div className="grid justify-items-center gap-2 text-center">
        <CheckCircle2 className="size-14 text-emerald-600" />
        <h1 className="text-2xl font-black text-neutral-900">Төлбөр амжилттай!</h1>
        <p className="max-w-sm text-sm text-muted-foreground">
          {detail.payerName}, таны {detail.attendeeCount} хүний бүртгэл баталгаажлаа.
        </p>
        <p className="mt-1 max-w-sm rounded-xl bg-[#FFF7EC] px-3 py-2 text-xs text-[#8a4d00]">
          Энэ хуудсыг хадгална уу — доорх QR тасалбар нь таны нэвтрэх эрх юм. Дэлгэцийн
          зураг авах, эсвэл холбоосыг хадгалж болно.
        </p>
      </div>
    );
  }

  if (detail.status === "pending" && detail.awaitingVerification) {
    return (
      <div className="grid justify-items-center gap-2 text-center">
        <Landmark className="size-14 text-sky-600" />
        <h1 className="text-2xl font-black text-neutral-900">Шилжүүлгийг шалгаж байна</h1>
        <p className="max-w-sm text-sm text-muted-foreground">
          Таны банкны шилжүүлгийг хүлээн авлаа. Зохион байгуулагч баталгаажуулмагц
          тасалбар энэ хуудсанд гарч ирнэ — холбоосоо хадгална уу.
        </p>
      </div>
    );
  }

  if (detail.status === "pending") {
    return (
      <div className="grid justify-items-center gap-2 text-center">
        <Clock className="size-14 animate-pulse text-[#F98C01]" />
        <h1 className="text-2xl font-black text-neutral-900">Төлбөрийг баталгаажуулж байна…</h1>
        <p className="max-w-sm text-sm text-muted-foreground">
          Хэдхэн секунд хүлээнэ үү. Byl-ээс төлбөр амжилттай хийсэн бол энэ хуудас
          автоматаар шинэчлэгдэнэ.
        </p>
      </div>
    );
  }

  return (
    <div className="grid justify-items-center gap-2 text-center">
      <XCircle className="size-14 text-destructive" />
      <h1 className="text-2xl font-black text-neutral-900">
        {detail.status === "expired" ? "Төлбөрийн хугацаа дууссан" : "Төлбөр амжилтгүй боллоо"}
      </h1>
      <p className="max-w-sm text-sm text-muted-foreground">
        Бүртгэл хадгалагдсан ч төлбөр хийгдээгүй байна. Дахин бүртгүүлж үзнэ үү.
      </p>
      <Button asChild className="mt-2">
        <a href="/event/registration">Дахин бүртгүүлэх</a>
      </Button>
    </div>
  );
}

function AttendeeCard({
  attendee,
  paid,
  origin,
}: {
  attendee: Detail["attendees"][number];
  paid: boolean;
  origin: string;
}) {
  const ticketUrl = attendee.ticketCode ? `${origin}/event/ticket/${attendee.ticketCode}` : null;

  async function copyTicketLink() {
    if (!ticketUrl) return;
    try {
      await navigator.clipboard.writeText(ticketUrl);
      toast.success("Тасалбарын холбоос хуулагдлаа");
    } catch {
      toast.error("Хуулж чадсангүй");
    }
  }

  return (
    <Card
      className={cn(
        "overflow-hidden border-neutral-200",
        paid && attendee.ticketCode && "border-neutral-900 bg-neutral-900",
      )}
    >
      <CardContent className="grid gap-3 py-5">
        <div className="grid gap-0.5 text-center">
          <p
            className={cn(
              "text-base font-bold",
              paid && attendee.ticketCode ? "text-white" : "text-neutral-900",
            )}
          >
            {attendee.fullName}
          </p>
          <p
            className={cn(
              "text-xs",
              paid && attendee.ticketCode ? "text-neutral-400" : "text-muted-foreground",
            )}
          >
            {attendee.grade}-р анги · {attendee.churchName}
          </p>
        </div>

        {paid && attendee.ticketCode ? (
          <div className="grid justify-items-center gap-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`/api/registration/tickets/${attendee.ticketCode}/qr`}
              alt={`QR тасалбар ${attendee.ticketCode}`}
              width={176}
              height={176}
              className="rounded-xl bg-white p-3"
            />
            <p className="text-[11px] font-semibold tracking-widest text-neutral-500 uppercase">
              Тасалбарын код
            </p>
            <p className="font-mono text-lg font-bold tracking-wider text-[#F98C01]">
              {attendee.ticketCode}
            </p>

            {attendee.checkedIn && (
              <p className="rounded-full bg-emerald-500/15 px-3 py-1 text-[11px] font-semibold text-emerald-400">
                Ирсэн бүртгэл хийгдсэн
              </p>
            )}

            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={copyTicketLink}
              className="mt-1 print:hidden"
            >
              <Copy className="size-3" />
              Тасалбарын холбоос хуулах
            </Button>
          </div>
        ) : (
          <p className="text-center text-xs text-muted-foreground">
            Төлбөр баталгаажмагц QR тасалбар энд харагдана.
          </p>
        )}
      </CardContent>
    </Card>
  );
}

export function RegistrationDetail({ initial }: { initial: Detail }) {
  const [detail, setDetail] = React.useState(initial);
  const [origin, setOrigin] = React.useState("");
  const pollsRef = React.useRef(0);

  React.useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  // Right after checkout the webhook usually hasn't landed yet, so a pending
  // registration re-checks itself for about a minute rather than making the
  // registrant reload the page by hand.
  React.useEffect(() => {
    if (detail.status !== "paid" && detail.status !== "pending") return;
    if (detail.status === "paid") return;

    let cancelled = false;

    const timer = setTimeout(async () => {
      if (cancelled) return;
      pollsRef.current += 1;

      try {
        const res = await fetch(`/api/registration/${detail.id}`, { cache: "no-store" });
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

  const stillWaiting =
    detail.status === "pending" && !detail.awaitingVerification && pollsRef.current >= MAX_POLLS;

  return (
    <div className="grid gap-6">
      <StatusHero detail={detail} />

      {stillWaiting && (
        <p className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-center text-xs text-amber-800">
          Төлбөр удаж байна. Хэрэв та төлбөрөө хийсэн бол хэдхэн минутын дараа энэ
          хуудсыг дахин ачаална уу — эсвэл зохион байгуулагчтай холбогдоно уу.
        </p>
      )}

      <Card className="border-neutral-200">
        <CardContent className="grid gap-2.5 text-sm">
          <div className="flex items-center justify-between gap-4">
            <span className="text-muted-foreground">Бүртгүүлсэн</span>
            <span className="font-medium">{formatDateTime(detail.createdAt)}</span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span className="text-muted-foreground">Бүртгэлийн төрөл</span>
            <span className="font-medium">
              {detail.registrantType === "church_leader" ? "Сүмийн ахлагчаар" : "Хувиараа"}
            </span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span className="text-muted-foreground">Холбоо барих</span>
            <span className="text-right font-medium">
              {detail.payerName}
              <span className="block text-xs text-neutral-400">
                {detail.payerPhoneMasked}
                {detail.payerEmailMasked ? ` · ${detail.payerEmailMasked}` : ""}
              </span>
            </span>
          </div>
          <div className="flex items-center justify-between gap-4 border-t border-neutral-200 pt-2.5">
            <span className="text-muted-foreground">
              {detail.attendeeCount} хүн × {formatMnt(detail.pricePerAttendeeMnt)}
            </span>
            <span className="text-base font-black text-[#F98C01]">
              {formatMnt(detail.totalMnt)}
            </span>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-3">
        <p className="text-center text-sm font-medium text-muted-foreground">
          {detail.status === "paid"
            ? `Тасалбар (${detail.attendees.length}) — хаалган дээр эндээс харуулна уу`
            : `Бүртгүүлсэн хүмүүс (${detail.attendees.length})`}
        </p>
        {detail.attendees.map((attendee) => (
          <AttendeeCard
            key={attendee.id}
            attendee={attendee}
            paid={detail.status === "paid"}
            origin={origin}
          />
        ))}
      </div>

      <div className="flex flex-wrap justify-center gap-2 print:hidden">
        {detail.status === "paid" && (
          <Button type="button" variant="outline" onClick={() => window.print()}>
            <Printer className="size-4" />
            Хэвлэх
          </Button>
        )}
        <Button asChild variant="outline">
          <a href="/event/status">
            <Search className="size-4" />
            Өөр бүртгэл шалгах
          </a>
        </Button>
      </div>

      <p className="text-center font-mono text-[10px] break-all text-neutral-300">{detail.id}</p>
    </div>
  );
}
