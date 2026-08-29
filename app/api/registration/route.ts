import { NextResponse } from "next/server";
import { v4 as uuid } from "uuid";

import { createInvoice, type BonumInvoiceItem } from "@/lib/bonum";
import { d1Query } from "@/lib/d1";
import { computePricing, getPricingSettings } from "@/lib/registration/pricing";
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

  const settings = await getPricingSettings();
  const pricing = computePricing(settings, input.attendees.length);

  try {
    await d1Query(
      `INSERT INTO registrations (
        id, registrant_type, payer_name, payer_phone, payer_email, attendee_count,
        price_per_attendee_mnt, tax_rate_percent, subtotal_mnt, tax_mnt, total_mnt,
        currency, status, bonum_transaction_id, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?, ?, ?)`,
      [
        registrationId,
        input.registrantType,
        input.payerName,
        input.payerPhone,
        input.payerEmail,
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

    for (const attendee of input.attendees) {
      await d1Query(
        `INSERT INTO attendees (
          id, registration_id, full_name, age, phone, parent_phone, church_name, grade, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          uuid(),
          registrationId,
          attendee.fullName,
          attendee.age,
          attendee.phone ?? null,
          attendee.parentPhone,
          attendee.churchName,
          attendee.grade,
          now,
        ],
      );

      await d1Query("INSERT OR IGNORE INTO churches (id, name, created_at) VALUES (?, ?, ?)", [
        uuid(),
        attendee.churchName,
        now,
      ]);
    }
  } catch (error) {
    console.error("Failed to persist registration", error);
    return NextResponse.json({ error: "database_error" }, { status: 500 });
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? new URL(request.url).origin;
  const callback = `${siteUrl}/event/registration/thank-you?rid=${registrationId}`;

  const items: BonumInvoiceItem[] = input.attendees.map((a) => ({
    title: a.fullName,
    amount: pricing.pricePerAttendeeMnt,
    count: 1,
    remark: `${a.grade}-р анги, ${a.churchName}`,
  }));

  if (pricing.taxMnt > 0) {
    items.push({ title: "Татвар", amount: pricing.taxMnt, count: 1 });
  }

  try {
    const invoice = await createInvoice({
      amount: pricing.totalMnt,
      transactionId: registrationId,
      callback,
      items,
    });

    await d1Query(
      `UPDATE registrations SET bonum_invoice_id = ?, bonum_follow_up_link = ?, updated_at = ? WHERE id = ?`,
      [invoice.invoiceId, invoice.followUpLink, new Date().toISOString(), registrationId],
    );

    return NextResponse.json({
      registrationId,
      followUpLink: invoice.followUpLink,
    });
  } catch (error) {
    console.error("Failed to create Bonum invoice", error);

    await d1Query(`UPDATE registrations SET status = 'failed', updated_at = ? WHERE id = ?`, [
      new Date().toISOString(),
      registrationId,
    ]);

    return NextResponse.json(
      { error: "payment_error", registrationId },
      { status: 502 },
    );
  }
}
