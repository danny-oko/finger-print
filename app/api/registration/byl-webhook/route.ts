import { NextResponse } from "next/server";
import { v4 as uuid } from "uuid";

import { verifyWebhookSignature, type BylWebhookEvent } from "@/lib/byl";
import { d1Query } from "@/lib/d1";
import { issueTicketsAndSendEmail } from "@/lib/registration/issueTickets";

export const runtime = "nodejs";

/**
 * Byl expects a 2xx within 5 seconds, and retries with exponential backoff
 * on anything else — so every branch below either finishes fast or
 * deliberately swallows a non-critical failure rather than letting it turn
 * into a retry loop.
 */
export async function POST(request: Request) {
  const rawBody = await request.text();
  const signatureHeader = request.headers.get("byl-signature");
  const signatureValid = verifyWebhookSignature(rawBody, signatureHeader);

  let event: BylWebhookEvent | null = null;
  try {
    event = JSON.parse(rawBody) as BylWebhookEvent;
  } catch {
    event = null;
  }

  const registrationId = event?.data?.object?.client_reference_id ?? null;

  // Best-effort audit log — a logging failure must never block signature
  // validation or the status update below.
  try {
    await d1Query(
      `INSERT INTO payment_events (id, registration_id, event_type, status, signature_valid, raw_payload, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        uuid(),
        registrationId,
        event?.type ?? "UNKNOWN",
        event?.data?.object?.status ?? null,
        signatureValid ? 1 : 0,
        rawBody,
        new Date().toISOString(),
      ],
    );
  } catch (error) {
    console.error("Failed to log Byl webhook event", error);
  }

  if (!signatureValid) {
    return NextResponse.json({ error: "invalid_signature" }, { status: 401 });
  }

  if (!event || !registrationId) {
    return NextResponse.json({ error: "invalid_payload" }, { status: 400 });
  }

  const now = new Date().toISOString();

  // Byl reports a claimed-but-unconfirmed bank transfer separately from an
  // actual payment. The registration stays 'pending' until a merchant
  // confirms it — this only records that it's now waiting on a human, which
  // the admin monitor surfaces so nobody's transfer sits unnoticed.
  if (event.type === "payment.awaiting_verification") {
    try {
      await d1Query(
        `UPDATE registrations SET awaiting_verification_at = ?, updated_at = ?
         WHERE id = ? AND status = 'pending'`,
        [now, now, registrationId],
      );
    } catch (error) {
      console.error("Failed to flag registration awaiting verification", error);
      return NextResponse.json({ error: "update_failed" }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  }

  if (event.type !== "checkout.completed") {
    // Not a payment outcome we act on (subscription/stock/etc.) —
    // acknowledge so Byl doesn't retry it indefinitely.
    return NextResponse.json({ ok: true, ignored: true });
  }

  try {
    await d1Query(
      `UPDATE registrations
       SET status = 'paid',
           byl_checkout_id = COALESCE(?, byl_checkout_id),
           paid_at = COALESCE(paid_at, ?),
           awaiting_verification_at = NULL,
           updated_at = ?
       WHERE id = ?`,
      [event.data.object.id ? String(event.data.object.id) : null, now, now, registrationId],
    );
  } catch (error) {
    console.error("Failed to mark registration paid from Byl webhook", error);
    return NextResponse.json({ error: "update_failed" }, { status: 500 });
  }

  // Best-effort — the payment itself is already recorded above, so a
  // ticket/email failure here must not turn into a Byl retry loop.
  try {
    await issueTicketsAndSendEmail(registrationId);
  } catch (error) {
    console.error("Failed to issue tickets / send ticket email", error);
  }

  return NextResponse.json({ ok: true });
}
