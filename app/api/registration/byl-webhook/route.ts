import { waitUntil } from "@vercel/functions";
import { NextResponse } from "next/server";
import { v4 as uuid } from "uuid";

import { trackServerEvent } from "@/lib/analytics/server";
import {
  parseBylAmount,
  readSignatureHeader,
  verifyWebhookSignature,
  type BylWebhookEvent,
} from "@/lib/byl";
import { d1Batch, d1Run, type D1Statement } from "@/lib/db/d1";
import { logServerError } from "@/lib/errors";
import { invalidateSeats } from "@/lib/registration/availability";
import { issueTickets } from "@/lib/registration/issueTickets";

export const runtime = "nodejs";

async function recordAnd(audit: D1Statement, change: D1Statement): Promise<void> {
  try {
    await d1Batch([audit, change]);
  } catch (error) {
    logServerError("byl.webhook", error, { step: "audit_with_change" });
    await d1Run(change.sql, change.params);
  }
}

export async function POST(request: Request) {
  const rawBody = await request.text();
  const signatureHeader = readSignatureHeader(request.headers);
  const signatureValid = verifyWebhookSignature(rawBody, signatureHeader);

  let event: BylWebhookEvent | null = null;
  try {
    event = JSON.parse(rawBody) as BylWebhookEvent;
  } catch {
    event = null;
  }

  const registrationId = event?.data?.object?.client_reference_id ?? null;
  const now = new Date().toISOString();

  const audit: D1Statement = {
    sql: `INSERT INTO payment_events (id, registration_id, event_type, status, signature_valid, received_signature, raw_payload, created_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    params: [
      uuid(),
      registrationId,
      event?.type ?? "UNKNOWN",
      event?.data?.object?.status ?? null,
      signatureValid ? 1 : 0,
      signatureHeader,
      rawBody,
      now,
    ],
  };

  const auditOnly = () =>
    d1Run(audit.sql, audit.params).catch((error) =>
      logServerError("byl.webhook", error, { step: "audit" }),
    );

  if (!signatureValid) {
    await auditOnly();
    // Presence and length only. That's still enough to tell a missing
    // header from a wrong secret or an unparsed signature format, without
    // writing a value derived from our webhook secret — or the request's
    // header names — into logs that outlive the request.
    console.error(
      `Byl webhook rejected: signature ${
        signatureHeader ? `present (${signatureHeader.length} chars)` : "MISSING"
      }`,
    );
    return NextResponse.json({ error: "invalid_signature" }, { status: 401 });
  }

  if (!event || !registrationId) {
    await auditOnly();
    return NextResponse.json({ error: "invalid_payload" }, { status: 400 });
  }

  // Byl reports a claimed-but-unconfirmed bank transfer separately from an
  // actual payment. The registration stays 'pending' until a merchant
  // confirms it — this only records that it's now waiting on a human, which
  // the admin monitor surfaces so nobody's transfer sits unnoticed.
  if (event.type === "payment.awaiting_verification") {
    try {
      await recordAnd(audit, {
        sql: `UPDATE registrations SET awaiting_verification_at = ?, updated_at = ?
              WHERE id = ? AND status = 'pending'`,
        params: [now, now, registrationId],
      });
    } catch (error) {
      logServerError("byl.webhook", error, { step: "flag_awaiting", registrationId });
      return NextResponse.json({ error: "update_failed" }, { status: 500 });
    }

    waitUntil(
      trackServerEvent("registration_awaiting_verification", {
        totalMnt: parseBylAmount(event.data.object.amount_total),
      }),
    );
    return NextResponse.json({ ok: true });
  }

  // A checkout and an invoice are two ways to be paid for the same
  // registration, so both settle it the same way.
  if (event.type !== "checkout.completed" && event.type !== "invoice.paid") {
    // Not a payment outcome we act on — acknowledge so Byl doesn't retry it.
    await auditOnly();
    return NextResponse.json({ ok: true, ignored: true });
  }

  // Only a checkout's id belongs in byl_checkout_id; an invoice id would
  // read as a checkout that never existed.
  const checkoutId =
    event.type === "checkout.completed" && event.data.object.id
      ? String(event.data.object.id)
      : null;

  try {
    await recordAnd(audit, {
      sql: `UPDATE registrations
               SET status = 'paid',
                   byl_checkout_id = COALESCE(?, byl_checkout_id),
                   paid_at = COALESCE(paid_at, ?),
                   awaiting_verification_at = NULL,
                   updated_at = ?
             WHERE id = ?`,
      params: [checkoutId, now, now, registrationId],
    });
  } catch (error) {
    logServerError("byl.webhook", error, { step: "mark_paid", registrationId });
    return NextResponse.json({ error: "update_failed" }, { status: 500 });
  }

  invalidateSeats();

  // The amount comes off the payload rather than a fresh SELECT — Byl wants
  // its answer within 5 seconds.
  waitUntil(
    trackServerEvent("registration_paid", {
      totalMnt: parseBylAmount(event.data.object.amount_total),
    }),
  );

  // Best-effort — the payment itself is recorded above, and the ticket page
  // retries issuing on its next load.
  try {
    await issueTickets(registrationId);
  } catch (error) {
    logServerError("byl.webhook", error, { step: "issue_tickets", registrationId });
  }

  return NextResponse.json({ ok: true });
}
