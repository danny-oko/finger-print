import { waitUntil } from "@vercel/functions";
import { NextResponse } from "next/server";
import { z } from "zod";

import { isAdminAuthenticated } from "@/lib/admin/auth";
import {
  STAFF_PAYMENTS,
  type MonitorResponse,
  type MonitorRow,
  type StaffRegistrationResponse,
} from "@/lib/admin/types";
import { d1Query } from "@/lib/db/d1";
import { httpErrorFor, logServerError } from "@/lib/errors";
import { createPaidRegistration, createRegistration } from "@/lib/registration/create";
import { createRegistrationSchema } from "@/lib/registration/schema";
import { reconcileAllPending } from "@/lib/registration/settle";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ROW_LIMIT = 5000;

type Row = {
  attendee_id: string;
  full_name: string;
  phone: string | null;
  parent_phone: string | null;
  church_name: string;
  grade: number | null;
  role: MonitorRow["role"];
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
  source: MonitorRow["source"];
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

  // In the background: a sweep can mean a few dozen Byl calls, and the
  // dashboard shouldn't wait on them. Whatever it settles shows on the next
  // refresh. Stale statuses beat an empty dashboard when Byl is unreachable.
  waitUntil(
    reconcileAllPending().catch((error) =>
      console.error("Failed to reconcile pending registrations with Byl", error),
    ),
  );

  try {
    const rows = await d1Query<Row>(
      `SELECT
         a.id AS attendee_id, a.full_name, a.phone, a.parent_phone,
         a.church_name, a.grade, a.role, a.ticket_code, a.checked_in_at,
         a.created_at AS attendee_created_at,
         r.id AS registration_id, r.registrant_type, r.payer_name, r.payer_phone,
         r.payer_email, r.attendee_count, r.price_per_attendee_mnt, r.total_mnt,
         r.currency, r.status, r.source, r.paid_at, r.awaiting_verification_at,
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
        role: row.role,
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
        source: row.source,
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

const STATUS: Record<string, number> = {
  phone_taken: 409,
  sold_out: 409,
  transfer_pending: 409,
  payment_error: 502,
};

// The same registration the public form makes, minus the queue and the
// open/closed switch. "paid" and "transfer" are money staff saw arrive at
// the desk, so both are paid on the spot.
export async function POST(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const payment = z.object({ payment: z.enum(STAFF_PAYMENTS) }).safeParse(body);
  const parsed = createRegistrationSchema.safeParse(body);
  if (!payment.success || !parsed.success) {
    return NextResponse.json({ error: "invalid_input" }, { status: 400 });
  }

  const origin = new URL(request.url).origin;
  const site = (process.env.NEXT_PUBLIC_SITE_URL ?? origin).replace(/\/+$/, "");

  try {
    const result =
      payment.data.payment === "checkout"
        ? await createRegistration(
            { ...parsed.data, paymentMethod: "checkout" },
            { origin, staff: true },
          )
        : await createPaidRegistration(parsed.data);

    if (!result.ok) {
      return NextResponse.json({ ...result, ok: undefined }, { status: STATUS[result.error] ?? 400 });
    }

    const registrationUrl = `${site}/event/registration/${result.registrationId}`;
    // A transfer's "payment page" is the registration page itself.
    const paymentUrl =
      "paymentUrl" in result && typeof result.paymentUrl === "string" && result.paymentUrl !== registrationUrl
        ? result.paymentUrl
        : null;
    const response: StaffRegistrationResponse = {
      registrationId: result.registrationId,
      registrationUrl,
      paymentUrl,
    };
    return NextResponse.json(response);
  } catch (error) {
    const { code, status } = httpErrorFor(error);
    logServerError("admin.registration.create", error, {
      attendees: parsed.data.attendees.length,
      payment: payment.data.payment,
    });
    return NextResponse.json({ error: code }, { status });
  }
}
