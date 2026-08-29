import { NextResponse } from "next/server";
import { v4 as uuid } from "uuid";

import { verifyWebhookChecksum, type BonumWebhookPayload } from "@/lib/bonum";
import { d1Query } from "@/lib/d1";
import { issueTicketsAndSendEmail } from "@/lib/registration/issueTickets";

export const runtime = "nodejs";

function resolveStatus(payload: BonumWebhookPayload): "paid" | "failed" | "expired" | null {
  if (payload.status === "SUCCESS") return "paid";
  if (payload.status === "FAILED") {
    if (payload.body?.invoiceStatus === "EXPIRED") return "expired";
    return "failed";
  }
  return null;
}

export async function POST(request: Request) {
  const rawBody = await request.text();
  const checksumHeader = request.headers.get("x-checksum-v2");
  const checksumValid = verifyWebhookChecksum(rawBody, checksumHeader);

  let payload: BonumWebhookPayload | null = null;
  try {
    payload = JSON.parse(rawBody) as BonumWebhookPayload;
  } catch {
    payload = null;
  }

  const registrationId = payload?.body?.transactionId ?? null;

  // Best-effort audit log — a logging failure must never block checksum
  // validation or the status update below.
  try {
    await d1Query(
      `INSERT INTO payment_events (id, registration_id, event_type, status, checksum_valid, raw_payload, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        uuid(),
        registrationId,
        payload?.type ?? "UNKNOWN",
        payload?.status ?? null,
        checksumValid ? 1 : 0,
        rawBody,
        new Date().toISOString(),
      ],
    );
  } catch (error) {
    console.error("Failed to log Bonum webhook event", error);
  }

  if (!checksumValid) {
    return NextResponse.json({ error: "invalid_checksum" }, { status: 401 });
  }

  if (!payload || !registrationId) {
    return NextResponse.json({ error: "invalid_payload" }, { status: 400 });
  }

  const newStatus = resolveStatus(payload);
  if (!newStatus) {
    // Unrecognized status — acknowledge so Bonum doesn't retry indefinitely.
    return NextResponse.json({ ok: true, ignored: true });
  }

  const now = new Date().toISOString();

  try {
    await d1Query(
      `UPDATE registrations
       SET status = ?, bonum_invoice_id = COALESCE(?, bonum_invoice_id), paid_at = CASE WHEN ? = 'paid' THEN ? ELSE paid_at END, updated_at = ?
       WHERE id = ?`,
      [newStatus, payload.body.invoiceId ?? null, newStatus, now, now, registrationId],
    );
  } catch (error) {
    console.error("Failed to update registration from Bonum webhook", error);
    return NextResponse.json({ error: "update_failed" }, { status: 500 });
  }

  if (newStatus === "paid") {
    // Best-effort — the payment itself is already recorded above, so a
    // ticket/email failure here must not turn into a Bonum retry loop.
    try {
      await issueTicketsAndSendEmail(registrationId);
    } catch (error) {
      console.error("Failed to issue tickets / send ticket email", error);
    }
  }

  return NextResponse.json({ ok: true });
}
