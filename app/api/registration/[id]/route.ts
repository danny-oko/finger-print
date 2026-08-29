import { NextResponse } from "next/server";

import { d1Query, d1QueryOne } from "@/lib/d1";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const registration = await d1QueryOne<{
    id: string;
    registrant_type: string;
    payer_name: string;
    attendee_count: number;
    total_mnt: number;
    currency: string;
    status: string;
  }>(
    `SELECT id, registrant_type, payer_name, attendee_count, total_mnt, currency, status
     FROM registrations WHERE id = ?`,
    [id],
  );

  if (!registration) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  if (registration.status !== "paid") {
    return NextResponse.json({ registration });
  }

  const tickets = await d1Query<{ full_name: string; ticket_code: string | null }>(
    `SELECT full_name, ticket_code FROM attendees WHERE registration_id = ? ORDER BY created_at ASC`,
    [id],
  );

  return NextResponse.json({
    registration,
    tickets: tickets.filter((t) => t.ticket_code),
  });
}
