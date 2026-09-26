import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { EventTicket } from "@/components/ticket/EventTicket";
import { Button } from "@/components/ui/button";
import { getTicketDetail } from "@/lib/registration/detail";

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
      <div className="grid w-full max-w-sm gap-4 md:max-w-2xl">
        <div className="grid justify-items-center gap-1 text-center">
          <p className="text-xs font-semibold text-[#F98C01]">2026.10.10 · FINGER PRINT</p>
          <h1 className="text-xl font-black text-neutral-900">Таны тасалбар</h1>
        </div>

        <EventTicket
          invited={ticket.invited}
          fullName={ticket.fullName}
          grade={ticket.grade}
          role={ticket.role}
          churchName={ticket.churchName}
          ticketCode={ticket.ticketCode}
          checkedIn={ticket.checkedIn}
        />

        <p className="text-center text-xs text-muted-foreground">
          {ticket.invited
            ? "Урилгаар бүртгүүлсэн."
            : `Төлбөрийг ${ticket.payerName} хийсэн.`}{" "}
          Хаалган дээр энэ QR-г харуулна уу.
        </p>

        <Button
          asChild
          variant="outline"
          className="h-11 w-full justify-self-center md:max-w-sm print:hidden"
        >
          <a href="/event/status">Бүртгэл шалгах</a>
        </Button>
      </div>
    </main>
  );
}
