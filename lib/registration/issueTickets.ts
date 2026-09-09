import { eq } from "drizzle-orm";

import { db } from "@/lib/db/client";
import { attendees, registrations } from "@/lib/db/schema";
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
 * Called once a registration is paid. Assigns a QR ticket code per attendee,
 * idempotently — safe to call again on a webhook retry or a reconcile.
 * Tickets are read off /event/registration/<id>, which the registrant reaches
 * by looking up their phone number, so issuing the codes is the whole job.
 */
export async function issueTickets(registrationId: string): Promise<void> {
  const registration = await db
    .select()
    .from(registrations)
    .where(eq(registrations.id, registrationId))
    .get();

  if (!registration) return;
  if (registration.ticketsIssuedAt) return;

  const attendeeRows = await db
    .select()
    .from(attendees)
    .where(eq(attendees.registrationId, registrationId))
    .all();

  for (const attendee of attendeeRows) {
    if (!attendee.ticketCode) await assignTicketCode(attendee.id);
  }

  await db
    .update(registrations)
    .set({ ticketsIssuedAt: new Date().toISOString() })
    .where(eq(registrations.id, registrationId))
    .run();
}
