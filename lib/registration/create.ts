import { v4 as uuid } from "uuid";

import { createCheckout, createInvoice, type BylCheckoutItem } from "@/lib/byl";
import { d1Batch, d1QueryOne, d1Run, placeholders, type D1Statement } from "@/lib/db/d1";
import { logServerError } from "@/lib/errors";
import {
  getAvailability,
  holdExpiry,
  invalidateSeats,
  LIVE_SEATS_SQL,
} from "@/lib/registration/availability";
import { formatGrade, toGradeColumns } from "@/lib/registration/grade";
import { invoiceDescription, paymentReference } from "@/lib/registration/invoice";
import { findAwaitingRegistration, findTakenPhones } from "@/lib/registration/phones";
import { computePricing, type PricingBreakdown } from "@/lib/registration/pricing";
import type {
  CreateInvitedRegistrationInput,
  CreateRegistrationInput,
} from "@/lib/registration/schema";
import { getRegistrationSettings } from "@/lib/registration/settings";
import { generateTicketCode } from "@/lib/registration/ticketCode";

// Creating a registration is one D1 request. The duplicate-phone rule, the
// capacity rule and the idempotency rule are all conditions on the INSERT
// itself, and D1 runs a batch as a single transaction — so two people racing
// for the last seat, or the same form submitted twice, can't both get in the
// way a read-then-write would let them.

export type Rejection =
  | { error: "phone_taken"; phones: string[] }
  | { error: "registration_closed" | "registration_paused" }
  | { error: "sold_out"; seatsLeft: number }
  | { error: "transfer_pending"; registrationId: string };

export type CreateResult =
  | { ok: true; registrationId: string; paymentUrl: string }
  | ({ ok: false } & Rejection)
  | { ok: false; error: "payment_error"; registrationId: string };

type RegistrationRow = {
  id: string;
  registrantType: "individual" | "church_leader";
  payerName: string;
  payerPhone: string;
  pricing: PricingBreakdown;
  status: "pending" | "paid";
  source: "public" | "invite";
  idempotencyKey: string | null;
  expiresAt: string | null;
  awaitingVerificationAt: string | null;
  now: string;
};

function guardedRegistrationInsert(
  row: RegistrationRow,
  rules: { phones: string[]; capacity: number | null },
): D1Statement {
  // A transfer still waiting on staff counts as taken too: that person has
  // most likely already sent the money.
  const phoneRule = rules.phones.length
    ? `AND NOT EXISTS (
         SELECT 1 FROM attendees a JOIN registrations r ON r.id = a.registration_id
          WHERE (r.status = 'paid'
                 OR (r.status = 'pending' AND r.awaiting_verification_at IS NOT NULL))
            AND a.phone IN (${placeholders(rules.phones.length)}))`
    : "";

  const { pricing } = row;

  return {
    sql: `INSERT INTO registrations (
            id, registrant_type, payer_name, payer_phone, attendee_count,
            price_per_attendee_mnt, tax_rate_percent, subtotal_mnt, tax_mnt, total_mnt,
            currency, status, source, byl_client_reference_id, idempotency_key, expires_at,
            awaiting_verification_at, paid_at, created_at, updated_at
          )
          SELECT ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
           WHERE (? IS NULL OR (${LIVE_SEATS_SQL}) + ? <= ?)
           ${phoneRule}
          ON CONFLICT DO NOTHING`,
    params: [
      row.id,
      row.registrantType,
      row.payerName,
      row.payerPhone,
      pricing.attendeeCount,
      pricing.pricePerAttendeeMnt,
      pricing.taxRatePercent,
      pricing.subtotalMnt,
      pricing.taxMnt,
      pricing.totalMnt,
      pricing.currency,
      row.status,
      row.source,
      row.id,
      row.idempotencyKey,
      row.expiresAt,
      row.awaitingVerificationAt,
      row.status === "paid" ? row.now : null,
      row.now,
      row.now,
      rules.capacity,
      row.now,
      pricing.attendeeCount,
      rules.capacity,
      ...rules.phones,
    ],
  };
}

type AttendeeRow = {
  fullName: string;
  phone: string | null;
  churchName: string;
  grade: CreateRegistrationInput["attendees"][number]["grade"];
  ticketCode?: string | null;
};

function attendeeInsert(registrationId: string, attendee: AttendeeRow, now: string): D1Statement {
  const { grade, role } = toGradeColumns(attendee.grade);
  return {
    sql: `INSERT INTO attendees (
            id, registration_id, full_name, phone, church_name, grade, role, ticket_code, created_at
          )
          SELECT ?, ?, ?, ?, ?, ?, ?, ?, ?
           WHERE EXISTS (SELECT 1 FROM registrations WHERE id = ?)
          ON CONFLICT(id) DO NOTHING`,
    params: [
      uuid(),
      registrationId,
      attendee.fullName,
      attendee.phone,
      attendee.churchName,
      grade,
      role,
      attendee.ticketCode ?? null,
      now,
      registrationId,
    ],
  };
}

function churchInsert(registrationId: string, name: string, now: string): D1Statement {
  return {
    sql: `INSERT OR IGNORE INTO churches (id, name, created_at)
          SELECT ?, ?, ? WHERE EXISTS (SELECT 1 FROM registrations WHERE id = ?)`,
    params: [uuid(), name, now, registrationId],
  };
}

async function explainRejection(phones: string[], seatsWanted: number): Promise<Rejection | null> {
  const taken = await findTakenPhones(phones);
  if (taken.length > 0) return { error: "phone_taken", phones: taken };

  const awaiting = await findAwaitingRegistration(phones);
  if (awaiting) return { error: "transfer_pending", registrationId: awaiting };

  invalidateSeats();
  const availability = await getAvailability();
  if (availability.seatsLeft !== null && availability.seatsLeft < seatsWanted) {
    return { error: "sold_out", seatsLeft: availability.seatsLeft };
  }

  return null;
}

type ExistingRow = {
  id: string;
  status: string;
  byl_checkout_url: string | null;
  awaiting_verification_at: string | null;
};

function findByIdempotencyKey(key: string) {
  return d1QueryOne<ExistingRow>(
    `SELECT id, status, byl_checkout_url, awaiting_verification_at
       FROM registrations WHERE idempotency_key = ?`,
    [key],
  );
}

function siteUrl(origin: string): string {
  return (process.env.NEXT_PUBLIC_SITE_URL ?? origin).replace(/\/+$/, "");
}

function registrationPage(registrationId: string, origin: string): CreateResult {
  return {
    ok: true,
    registrationId,
    paymentUrl: `${siteUrl(origin)}/event/registration/${registrationId}`,
  };
}

// Someone who started paying online and switched to a transfer in the same
// review. The seats stay held until staff look at it, like any transfer.
async function switchToTransfer(registrationId: string) {
  const now = new Date().toISOString();
  await d1Run(
    `UPDATE registrations
        SET awaiting_verification_at = COALESCE(awaiting_verification_at, ?),
            expires_at = NULL, updated_at = ?
      WHERE id = ? AND status = 'pending'`,
    [now, now, registrationId],
  );
}

async function startPayment(
  registrationId: string,
  input: CreateRegistrationInput,
  pricing: PricingBreakdown,
  origin: string,
): Promise<string> {
  let paymentUrl: string;
  let checkoutId: string | null = null;

  if (input.paymentMethod === "invoice") {
    // An invoice has no line items and no success_url — what it has is a
    // description, which is the only text we control on the payer's bank
    // statement. Byl voids it at the due date, one day by default.
    const invoice = await createInvoice({
      amount: pricing.totalMnt,
      description: invoiceDescription(paymentReference(registrationId), input.attendees.length),
      clientReferenceId: registrationId,
    });
    paymentUrl = invoice.url;
  } else {
    const base = siteUrl(origin);
    const items: BylCheckoutItem[] = input.attendees.map((a) => ({
      price_data: {
        unit_amount: pricing.pricePerAttendeeMnt,
        product_data: {
          name: `${a.fullName} — ${formatGrade(toGradeColumns(a.grade))}, ${input.churchName}`,
        },
      },
      quantity: 1,
    }));

    if (pricing.taxMnt > 0) {
      items.push({
        price_data: { unit_amount: pricing.taxMnt, product_data: { name: "Татвар" } },
        quantity: 1,
      });
    }

    const checkout = await createCheckout({
      items,
      clientReferenceId: registrationId,
      successUrl: `${base}/event/registration/${registrationId}`,
      cancelUrl: `${base}/event/registration/${registrationId}?cancelled=1`,
    });
    paymentUrl = checkout.url;
    checkoutId = String(checkout.id);
  }

  // byl_checkout_id stays null for an invoice, since an invoice id there
  // would read as a checkout that never existed.
  await d1Run(
    `UPDATE registrations
        SET byl_checkout_id = COALESCE(?, byl_checkout_id), byl_checkout_url = ?, updated_at = ?
      WHERE id = ?`,
    [checkoutId, paymentUrl, new Date().toISOString(), registrationId],
  );

  return paymentUrl;
}

async function markPaymentFailed(registrationId: string) {
  // If even this write fails the row stays pending, which is the safer of
  // the two wrong states.
  await d1Run(
    "UPDATE registrations SET status = 'failed', updated_at = ? WHERE id = ? AND status = 'pending'",
    [new Date().toISOString(), registrationId],
  ).catch((error) =>
    logServerError("registration.create", error, { step: "mark_failed", registrationId }),
  );
}

async function paymentFor(
  registrationId: string,
  input: CreateRegistrationInput,
  pricing: PricingBreakdown,
  origin: string,
): Promise<CreateResult> {
  try {
    const paymentUrl = await startPayment(registrationId, input, pricing, origin);
    return { ok: true, registrationId, paymentUrl };
  } catch (error) {
    logServerError("registration.checkout", error, {
      step: input.paymentMethod === "invoice" ? "create_byl_invoice" : "create_byl_checkout",
      registrationId,
      attendees: input.attendees.length,
      totalMnt: pricing.totalMnt,
    });
    await markPaymentFailed(registrationId);
    return { ok: false, error: "payment_error", registrationId };
  }
}

async function resume(
  existing: ExistingRow,
  input: CreateRegistrationInput,
  pricing: PricingBreakdown,
  origin: string,
): Promise<CreateResult> {
  // Already paid, failed, or a transfer staff are checking: the
  // registration page explains each, and none of them should start a payment.
  if (existing.status !== "pending" || existing.awaiting_verification_at) {
    return registrationPage(existing.id, origin);
  }

  if (input.paymentMethod === "transfer") {
    await switchToTransfer(existing.id);
    return registrationPage(existing.id, origin);
  }

  if (existing.byl_checkout_url) {
    return { ok: true, registrationId: existing.id, paymentUrl: existing.byl_checkout_url };
  }

  return paymentFor(existing.id, input, pricing, origin);
}

export async function createRegistration(
  input: CreateRegistrationInput,
  { origin }: { origin: string },
): Promise<CreateResult> {
  const settings = await getRegistrationSettings();

  if (settings.state === "closed") return { ok: false, error: "registration_closed" };
  if (settings.state === "paused") return { ok: false, error: "registration_paused" };

  const pricing = computePricing(settings.pricing, input.attendees.length);
  const phones = [...new Set(input.attendees.map((a) => a.phone).filter((p): p is string => !!p))];
  const registrationId = uuid();
  const now = new Date().toISOString();
  const key = input.idempotencyKey ?? null;
  const transfer = input.paymentMethod === "transfer";

  const [inserted] = await d1Batch(
    [
      guardedRegistrationInsert(
        {
          id: registrationId,
          registrantType: input.registrantType,
          payerName: input.payerName,
          payerPhone: input.payerPhone,
          pricing,
          status: "pending",
          source: "public",
          idempotencyKey: key,
          expiresAt: input.paymentMethod === "transfer" ? null : holdExpiry(input.paymentMethod),
          awaitingVerificationAt: transfer ? now : null,
          now,
        },
        { phones, capacity: settings.capacity },
      ),
      ...input.attendees.map((attendee) =>
        attendeeInsert(
          registrationId,
          { ...attendee, phone: attendee.phone ?? null, churchName: input.churchName },
          now,
        ),
      ),
      churchInsert(registrationId, input.churchName, now),
    ],
    { idempotent: true },
  );

  if (inserted.changes === 0) {
    const existing = key ? await findByIdempotencyKey(key) : null;
    if (existing) return resume(existing, input, pricing, origin);

    const rejection = await explainRejection(phones, input.attendees.length);
    if (rejection) return { ok: false, ...rejection };

    throw new Error("Registration insert matched no rule but wrote nothing");
  }

  invalidateSeats();
  if (transfer) return registrationPage(registrationId, origin);
  return paymentFor(registrationId, input, pricing, origin);
}

export type InvitedResult =
  | { ok: true; registrationId: string }
  | ({ ok: false } & Rejection);

export async function createInvitedRegistration(
  input: CreateInvitedRegistrationInput,
): Promise<InvitedResult> {
  const settings = await getRegistrationSettings();
  const registrationId = uuid();
  const now = new Date().toISOString();
  const key = input.idempotencyKey ?? null;
  const pricing = computePricing({ ...settings.pricing, pricePerAttendeeMnt: 0, taxRatePercent: 0 }, 1);

  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const [inserted] = await d1Batch(
        [
          guardedRegistrationInsert(
            {
              id: registrationId,
              registrantType: "individual",
              payerName: input.fullName,
              payerPhone: input.phone,
              pricing,
              status: "paid",
              source: "invite",
              idempotencyKey: key,
              expiresAt: null,
              awaitingVerificationAt: null,
              now,
            },
            { phones: [input.phone], capacity: settings.capacity },
          ),
          attendeeInsert(
            registrationId,
            { ...input, ticketCode: generateTicketCode() },
            now,
          ),
          {
            sql: "UPDATE registrations SET tickets_issued_at = ? WHERE id = ?",
            params: [now, registrationId],
          },
          churchInsert(registrationId, input.churchName, now),
        ],
        { idempotent: true },
      );

      if (inserted.changes === 0) {
        const existing = key ? await findByIdempotencyKey(key) : null;
        if (existing) return { ok: true, registrationId: existing.id };

        const rejection = await explainRejection([input.phone], 1);
        if (rejection) return { ok: false, ...rejection };

        throw new Error("Invited registration insert matched no rule but wrote nothing");
      }

      invalidateSeats();
      return { ok: true, registrationId };
    } catch (error) {
      // A ticket-code collision rolls the batch back; anything else is real.
      if (!/UNIQUE.*ticket_code/i.test(String((error as Error)?.message))) throw error;
    }
  }

  throw new Error("Could not mint a unique ticket code");
}

