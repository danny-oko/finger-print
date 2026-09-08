import { eq } from "drizzle-orm";

import { db } from "@/lib/db/client";
import { attendees, registrations } from "@/lib/db/schema";
import { isTicketEmailConfigured, sendTicketEmail } from "@/lib/email/sendTicketEmail";
import { generateTicketCode } from "@/lib/registration/ticketCode";

const MAX_CODE_ATTEMPTS = 5;

async function assignTicketCode(attendeeId: string): Promise<string> {
  let lastError: unknown;

  for (let attempt = 0; attempt < MAX_CODE_ATTEMPTS; attempt++) {
    const code = generateTicketCode();
    try {
      // The unique index on attendees.ticket_code turns a (practically
      // impossible) collision into a query error, which we just retry.
      await db.update(attendees).set({ ticketCode: code }).where(eq(attendees.id, attendeeId)).run();
      return code;
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError ?? new Error("Failed to assign a unique ticket code");
}

/**
 * Called once a Byl webhook marks a registration "paid". Generates a QR
 * ticket code per attendee (idempotently — safe to call again on a retried
 * webhook). If Gmail is configured they're also emailed to the payer in one
 * message; if it isn't, the codes are still issued and the success page is
 * how the registrant gets them.
 */
export async function issueTicketsAndSendEmail(registrationId: string): Promise<void> {
  const registration = await db
    .select()
    .from(registrations)
    .where(eq(registrations.id, registrationId))
    .get();

  if (!registration) return;
  if (registration.ticketsIssuedAt) return; // already handled — webhook retry

  const attendeeRows = await db
    .select()
    .from(attendees)
    .where(eq(attendees.registrationId, registrationId))
    .all();

  const tickets = [];
  for (const attendee of attendeeRows) {
    const code = attendee.ticketCode ?? (await assignTicketCode(attendee.id));
    tickets.push({ name: attendee.fullName, code });
  }

  // Codes are assigned above no matter what, so a missing email address or
  // absent SMTP config costs the registrant nothing — it only means the
  // tickets arrive on screen rather than in their inbox.
  //
  // Neither message names the registration. Its id is the only thing
  // guarding /event/registration/<id>, which lists every attendee's name and
  // ticket code, so logging one hands that page to anyone reading logs — and
  // both conditions here are global or near-impossible, so an id would add
  // nothing to diagnosing them.
  if (!isTicketEmailConfigured()) {
    console.info("Tickets issued; email skipped (no SMTP config)");
  } else if (!registration.payerEmail) {
    console.warn("Tickets issued, but the registration has no payer_email to send to");
  } else {
    await sendTicketEmail({
      to: registration.payerEmail,
      payerName: registration.payerName,
      tickets,
    });
  }

  await db
    .update(registrations)
    .set({ ticketsIssuedAt: new Date().toISOString() })
    .where(eq(registrations.id, registrationId))
    .run();
}
