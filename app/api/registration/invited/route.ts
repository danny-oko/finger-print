import { waitUntil } from "@vercel/functions";
import { NextResponse } from "next/server";
import { v4 as uuid } from "uuid";

import { trackServerEvent } from "@/lib/analytics/server";
import { d1Query } from "@/lib/d1";
import { httpErrorFor, logServerError } from "@/lib/errors";
import { toGradeColumns } from "@/lib/registration/grade";
import { isValidInviteToken } from "@/lib/registration/invite";
import { issueTickets } from "@/lib/registration/issueTickets";
import { findTakenPhones } from "@/lib/registration/phones";
import { createInvitedRegistrationSchema } from "@/lib/registration/schema";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);

  // Checked before the body so a wrong token gets the same 404 as a route
  // that doesn't exist, whatever else was sent.
  if (!isValidInviteToken((body as { token?: unknown } | null)?.token)) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  const parsed = createInvitedRegistrationSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "invalid_input", issues: parsed.error.issues },
      { status: 400 },
    );
  }

  const input = parsed.data;
  const registrationId = uuid();
  const now = new Date().toISOString();

  try {
    const taken = await findTakenPhones([input.phone]);

    if (taken.length > 0) {
      waitUntil(
        trackServerEvent("registration_create_failed", { reason: "phone_taken" }),
      );
      return NextResponse.json(
        { error: "phone_taken", phones: taken },
        { status: 409 },
      );
    }
  } catch (error) {
    const { code, status } = httpErrorFor(error);
    logServerError("registration.invited", error, {
      step: "check_taken_phones",
      registrationId,
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
        status, source, byl_client_reference_id, paid_at, created_at, updated_at
      ) VALUES (?, 'individual', ?, ?, 1, 0, 0, 0, 0, 0, 'paid', 'invite', ?, ?, ?, ?)`,
      [registrationId, input.fullName, input.phone, registrationId, now, now, now],
    );

    step = "insert_attendee";

    const { grade, role } = toGradeColumns(input.grade);

    await d1Query(
      `INSERT INTO attendees (
        id, registration_id, full_name, phone, church_name, grade, role, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [uuid(), registrationId, input.fullName, input.phone, input.churchName, grade, role, now],
    );
  } catch (error) {
    const { code, status } = httpErrorFor(error);
    logServerError("registration.invited", error, { step, registrationId });
    waitUntil(trackServerEvent("registration_create_failed", { reason: code }));

    // No transactions over D1's HTTP API. A paid registration with nobody on
    // it would be invisible in the admin monitor, so take it back out.
    if (step === "insert_attendee") {
      await d1Query("DELETE FROM registrations WHERE id = ?", [registrationId]).catch(
        (cleanupError) =>
          logServerError("registration.invited", cleanupError, {
            step: "delete_orphan",
            registrationId,
          }),
      );
    }

    return NextResponse.json({ error: code }, { status });
  }

  // Past this point the person is registered: failing the request would
  // send them back to a form that now answers "phone_taken".
  await d1Query("INSERT OR IGNORE INTO churches (id, name, created_at) VALUES (?, ?, ?)", [
    uuid(),
    input.churchName,
    now,
  ]).catch((error) =>
    logServerError("registration.invited", error, { step: "insert_church", registrationId }),
  );

  // A failure here is retried when the registration page loads.
  try {
    await issueTickets(registrationId);
  } catch (error) {
    logServerError("registration.invited", error, { step: "issue_tickets", registrationId });
  }

  waitUntil(trackServerEvent("registration_invited", {}));

  return NextResponse.json({ registrationId });
}
