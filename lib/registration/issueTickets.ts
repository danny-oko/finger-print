import { d1Batch, d1Query } from "@/lib/db/d1";
import { generateTicketCode } from "@/lib/registration/ticketCode";

const MAX_ATTEMPTS = 4;

type Row = { attendee_id: string | null; ticket_code: string | null; tickets_issued_at: string | null };

export async function issueTickets(registrationId: string): Promise<void> {
  const rows = await d1Query<Row>(
    `SELECT a.id AS attendee_id, a.ticket_code, r.tickets_issued_at
       FROM registrations r
       LEFT JOIN attendees a ON a.registration_id = r.id
      WHERE r.id = ?`,
    [registrationId],
  );

  if (rows.length === 0 || rows[0].tickets_issued_at) return;

  const missing = rows.filter((r) => r.attendee_id && !r.ticket_code).map((r) => r.attendee_id!);
  let lastError: unknown;

  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    try {
      await d1Batch(
        [
          ...missing.map((attendeeId) => ({
            sql: "UPDATE attendees SET ticket_code = ? WHERE id = ? AND ticket_code IS NULL",
            params: [generateTicketCode(), attendeeId],
          })),
          {
            sql: "UPDATE registrations SET tickets_issued_at = ? WHERE id = ? AND tickets_issued_at IS NULL",
            params: [new Date().toISOString(), registrationId],
          },
        ],
        { idempotent: true },
      );
      return;
    } catch (error) {
      lastError = error;
      if (!/UNIQUE/i.test(String((error as Error)?.message))) throw error;
    }
  }

  throw lastError;
}
