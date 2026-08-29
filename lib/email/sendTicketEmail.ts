import nodemailer from "nodemailer";
import QRCode from "qrcode";

import { renderTicketEmailHtml, type TicketForEmail } from "@/lib/email/ticketEmailTemplate";

function getTransporter() {
  const user = process.env.GMAIL_USER;
  const pass = process.env.GMAIL_APP_PASSWORD;

  if (!user || !pass) {
    throw new Error(
      "Missing Gmail SMTP env vars (GMAIL_USER, GMAIL_APP_PASSWORD). See docs/registration-setup.md.",
    );
  }

  return { transporter: nodemailer.createTransport({ service: "gmail", auth: { user, pass } }), user };
}

export type TicketInput = { name: string; code: string };

/**
 * Sends one email containing every attendee's QR ticket for a paid
 * registration. Each QR encodes only its `ticket_code` — no secrets, just
 * the opaque string the future admin scanner will look up.
 */
export async function sendTicketEmail(input: {
  to: string;
  payerName: string;
  tickets: TicketInput[];
}): Promise<void> {
  const { transporter, user } = getTransporter();

  const tickets: TicketForEmail[] = input.tickets.map((ticket, index) => ({
    ...ticket,
    cid: `ticket-qr-${index}@finger-print`,
  }));

  const attachments = await Promise.all(
    tickets.map(async (ticket) => ({
      cid: ticket.cid,
      filename: `finger-print-ticket-${ticket.code}.png`,
      content: await QRCode.toBuffer(ticket.code, { width: 320, margin: 1 }),
      contentType: "image/png",
    })),
  );

  await transporter.sendMail({
    from: `"Finger Print" <${user}>`,
    to: input.to,
    subject:
      tickets.length > 1 ? "Таны Finger Print 2026 тасалбарууд" : "Таны Finger Print 2026 тасалбар",
    html: renderTicketEmailHtml(input.payerName, tickets),
    attachments,
  });
}
