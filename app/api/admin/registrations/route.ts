import { NextResponse } from "next/server";

import { isAdminAuthenticated } from "@/lib/admin/auth";
import type { MonitorResponse, MonitorRow } from "@/lib/admin/types";
import { d1Query } from "@/lib/d1";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ROW_LIMIT = 5000;

type Row = {
  attendee_id: string;
  full_name: string;
  phone: string | null;
  parent_phone: string | null;
  church_name: string;
  grade: number;
  ticket_code: string | null;
  checked_in_at: string | null;
  attendee_created_at: string;
  registration_id: string;
  registrant_type: MonitorRow["registrantType"];
  payer_name: string;
  payer_phone: string;
  payer_email: string | null;
  attendee_count: number;
  price_per_attendee_mnt: number;
  total_mnt: number;
  currency: string;
  status: MonitorRow["status"];
  paid_at: string | null;
  awaiting_verification_at: string | null;
  tickets_issued_at: string | null;
  byl_checkout_id: string | null;
  byl_checkout_url: string | null;
  registration_created_at: string;
};

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  try {
    const rows = await d1Query<Row>(
      `SELECT
         a.id AS attendee_id, a.full_name, a.phone, a.parent_phone,
         a.church_name, a.grade, a.ticket_code, a.checked_in_at,
         a.created_at AS attendee_created_at,
         r.id AS registration_id, r.registrant_type, r.payer_name, r.payer_phone,
         r.payer_email, r.attendee_count, r.price_per_attendee_mnt, r.total_mnt,
         r.currency, r.status, r.paid_at, r.awaiting_verification_at,
         r.tickets_issued_at, r.byl_checkout_id, r.byl_checkout_url,
         r.created_at AS registration_created_at
       FROM attendees a
       JOIN registrations r ON r.id = a.registration_id
       ORDER BY r.created_at DESC, a.created_at ASC
       LIMIT ?`,
      [ROW_LIMIT],
    );

    const body: MonitorResponse = {
      rows: rows.map((row) => ({
        attendeeId: row.attendee_id,
        fullName: row.full_name,
        phone: row.phone,
        parentPhone: row.parent_phone,
        churchName: row.church_name,
        grade: row.grade,
        ticketCode: row.ticket_code,
        checkedInAt: row.checked_in_at,
        attendeeCreatedAt: row.attendee_created_at,
        registrationId: row.registration_id,
        registrantType: row.registrant_type,
        payerName: row.payer_name,
        payerPhone: row.payer_phone,
        payerEmail: row.payer_email,
        attendeeCount: row.attendee_count,
        pricePerAttendeeMnt: row.price_per_attendee_mnt,
        totalMnt: row.total_mnt,
        currency: row.currency,
        status: row.status,
        paidAt: row.paid_at,
        awaitingVerificationAt: row.awaiting_verification_at,
        ticketsIssuedAt: row.tickets_issued_at,
        bylCheckoutId: row.byl_checkout_id,
        bylCheckoutUrl: row.byl_checkout_url,
        registrationCreatedAt: row.registration_created_at,
      })),
      generatedAt: new Date().toISOString(),
      truncated: rows.length === ROW_LIMIT,
    };

    return NextResponse.json(body);
  } catch (error) {
    console.error("Failed to load registrations for the admin monitor", error);
    return NextResponse.json({ error: "database_error" }, { status: 500 });
  }
}
