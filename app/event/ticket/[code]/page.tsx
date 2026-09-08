import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CheckCircle2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getTicketDetail } from "@/lib/registration/detail";
import { formatGrade } from "@/lib/registration/grade";

export const metadata: Metadata = {
  title: "Тасалбар | Finger Print",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

const TICKET_CODE_PATTERN = /^FP-[A-Z0-9]{4}-[A-Z0-9]{4}$/;

/**
 * One attendee's own ticket. A church leader who paid for a group can send
 * each teen just their own link instead of the whole registration, which
 * would show them everyone else's details too.
 */
export default async function TicketPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;

  if (!TICKET_CODE_PATTERN.test(code)) notFound();

  const ticket = await getTicketDetail(code).catch(() => null);
  if (!ticket) notFound();

  return (
    <main className="flex min-h-dvh items-center justify-center bg-neutral-50 px-4 py-10">
      <div className="grid w-full max-w-sm gap-4">
        <div className="grid justify-items-center gap-1 text-center">
          <p className="text-xs font-semibold text-[#F98C01]">2026.10.10 · FINGER PRINT</p>
          <h1 className="text-xl font-black text-neutral-900">Таны тасалбар</h1>
        </div>

        <Card className="overflow-hidden border-neutral-900 bg-neutral-900">
          <CardContent className="grid justify-items-center gap-3 py-8 text-center">
            <p className="text-lg font-bold text-white">{ticket.fullName}</p>
            <p className="text-xs text-neutral-400">
              {formatGrade(ticket)} · {ticket.churchName}
            </p>

            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`/api/registration/tickets/${ticket.ticketCode}/qr`}
              alt={`QR тасалбар ${ticket.ticketCode}`}
              width={200}
              height={200}
              className="rounded-xl bg-white p-3"
            />

            <p className="text-[11px] font-semibold tracking-widest text-neutral-500 uppercase">
              Тасалбарын код
            </p>
            <p className="font-mono text-xl font-bold tracking-wider text-[#F98C01]">
              {ticket.ticketCode}
            </p>

            {ticket.checkedIn && (
              <p className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-3 py-1 text-[11px] font-semibold text-emerald-400">
                <CheckCircle2 className="size-3" />
                Ирсэн бүртгэл хийгдсэн
              </p>
            )}
          </CardContent>
        </Card>

        <p className="text-center text-xs text-muted-foreground">
          Төлбөрийг {ticket.payerName} хийсэн. Хаалган дээр энэ QR-г харуулна уу.
        </p>

        <Button asChild variant="outline" className="print:hidden">
          <a href="/event/status">Бүртгэл шалгах</a>
        </Button>
      </div>
    </main>
  );
}
