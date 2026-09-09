import { waitUntil } from "@vercel/functions";
import { NextResponse } from "next/server";
import { v4 as uuid } from "uuid";

import { trackServerEvent } from "@/lib/analytics/server";
import { createCheckout, createInvoice, type BylCheckoutItem } from "@/lib/byl";
import { d1Query } from "@/lib/d1";
import { httpErrorFor, logServerError } from "@/lib/errors";
import { formatGrade, toGradeColumns } from "@/lib/registration/grade";
import { invoiceDescription, paymentReference } from "@/lib/registration/invoice";
import {
  computePricing,
  getPricingSettings,
  type PricingBreakdown,
} from "@/lib/registration/pricing";
import { createRegistrationSchema } from "@/lib/registration/schema";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = createRegistrationSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "invalid_input", issues: parsed.error.issues },
      { status: 400 },
    );
  }

  const input = parsed.data;
  const registrationId = uuid();
  const now = new Date().toISOString();

  let pricing: PricingBreakdown;
  try {
    const settings = await getPricingSettings();
    pricing = computePricing(settings, input.attendees.length);
  } catch (error) {
    const { code, status } = httpErrorFor(error);
    logServerError("registration.create", error, {
      step: "read_pricing",
      registrationId,
      attendees: input.attendees.length,
    });
    waitUntil(trackServerEvent("registration_create_failed", { reason: code }));
    return NextResponse.json({ error: code }, { status });
  }

  let step = "insert_registration";

  try {
    await d1Query(
      `INSERT INTO registrations (
        id, registrant_type, payer_name, payer_phone, attendee_count,
        price_per_attendee_mnt, tax_rate_percent, subtotal_mnt, tax_mnt, total_mnt,
        currency, status, byl_client_reference_id, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?, ?, ?)`,
      [
        registrationId,
        input.registrantType,
        input.payerName,
        input.payerPhone,
        input.attendees.length,
        pricing.pricePerAttendeeMnt,
        pricing.taxRatePercent,
        pricing.subtotalMnt,
        pricing.taxMnt,
        pricing.totalMnt,
        pricing.currency,
        registrationId,
        now,
        now,
      ],
    );

    step = "insert_attendee";

    // One church per registration — the form asks for it once — but it's
    // still denormalised onto every attendee row so the admin monitor can
    // group and filter attendees without joining back.
    for (const attendee of input.attendees) {
      const { grade, role } = toGradeColumns(attendee.grade);

      await d1Query(
        `INSERT INTO attendees (
          id, registration_id, full_name, phone, church_name, grade, role, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          uuid(),
          registrationId,
          attendee.fullName,
          attendee.phone ?? null,
          input.churchName,
          grade,
          role,
          now,
        ],
      );
    }

    step = "insert_church";

    await d1Query(
      "INSERT OR IGNORE INTO churches (id, name, created_at) VALUES (?, ?, ?)",
      [uuid(), input.churchName, now],
    );
  } catch (error) {
    const { code, status } = httpErrorFor(error);
    logServerError("registration.create", error, {
      step,
      registrationId,
      attendees: input.attendees.length,
      registrantType: input.registrantType,
    });
    waitUntil(trackServerEvent("registration_create_failed", { reason: code }));
    return NextResponse.json({ error: code }, { status });
  }

  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ?? new URL(request.url).origin;
  const successUrl = `${siteUrl}/event/registration/${registrationId}`;
  const cancelUrl = `${siteUrl}/event/registration/${registrationId}?cancelled=1`;

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
      price_data: {
        unit_amount: pricing.taxMnt,
        product_data: { name: "Татвар" },
      },
      quantity: 1,
    });
  }

  try {
    let paymentUrl: string;
    let bylCheckoutId: string | null = null;

    if (input.paymentMethod === "invoice") {
      // An invoice has no line items and no success_url — what it has is a
      // description, which is the only text we control on the payer's bank
      // statement. Byl voids it at the due date, one day by default.
      const invoice = await createInvoice({
        amount: pricing.totalMnt,
        description: invoiceDescription(
          paymentReference(registrationId),
          input.attendees.length,
        ),
        clientReferenceId: registrationId,
      });

      paymentUrl = invoice.url;
    } else {
      const checkout = await createCheckout({
        items,
        clientReferenceId: registrationId,
        successUrl,
        cancelUrl,
      });

      paymentUrl = checkout.url;
      bylCheckoutId = String(checkout.id);
    }

    // byl_checkout_url holds whichever payment page this registration got —
    // the admin monitor uses it as "the link to chase an unpaid one with".
    // byl_checkout_id stays null for an invoice, since an invoice id there
    // would read as a checkout that never existed.
    await d1Query(
      `UPDATE registrations SET byl_checkout_id = COALESCE(?, byl_checkout_id), byl_checkout_url = ?, updated_at = ? WHERE id = ?`,
      [bylCheckoutId, paymentUrl, new Date().toISOString(), registrationId],
    );

    // The client's own "submitted" event fires before this request and can
    // be lost to the payment redirect, so this is the reliable top of the
    // funnel: a row exists and Byl has something to pay against it.
    waitUntil(
      trackServerEvent("registration_created", {
        attendees: input.attendees.length,
        registrantType: input.registrantType,
        paymentMethod: input.paymentMethod,
        totalMnt: pricing.totalMnt,
      }),
    );

    return NextResponse.json({
      registrationId,
      paymentUrl,
    });
  } catch (error) {
    logServerError("registration.checkout", error, {
      step: input.paymentMethod === "invoice" ? "create_byl_invoice" : "create_byl_checkout",
      registrationId,
      attendees: input.attendees.length,
      totalMnt: pricing.totalMnt,
    });
    waitUntil(
      trackServerEvent("registration_create_failed", { reason: "payment_error" }),
    );

    // The registration row is real and paid-for later, so mark it rather
    // than leaving it pending forever. If even this write fails the row
    // stays pending, which is the safer of the two wrong states.
    await d1Query(
      `UPDATE registrations SET status = 'failed', updated_at = ? WHERE id = ?`,
      [new Date().toISOString(), registrationId],
    ).catch((markError) =>
      logServerError("registration.checkout", markError, {
        step: "mark_failed",
        registrationId,
      }),
    );

    return NextResponse.json(
      { error: "payment_error", registrationId },
      { status: 502 },
    );
  }
}
