export type TicketForEmail = {
  name: string;
  code: string;
  cid: string;
};

const ACCENT = "#F98C01";

function ticketCardHtml(ticket: TicketForEmail): string {
  return `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:16px;background:#141414;border-radius:16px;overflow:hidden;">
      <tr>
        <td style="padding:24px;text-align:center;">
          <p style="margin:0 0 16px;color:#ffffff;font-size:16px;font-weight:700;">${ticket.name}</p>
          <img
            src="cid:${ticket.cid}"
            width="176"
            height="176"
            alt="QR тасалбар ${ticket.code}"
            style="display:block;margin:0 auto;border-radius:12px;background:#ffffff;padding:12px;"
          />
          <p style="margin:16px 0 0;color:#8a8a8a;font-size:12px;letter-spacing:0.08em;text-transform:uppercase;">
            Тасалбарын код
          </p>
          <p style="margin:4px 0 0;color:${ACCENT};font-size:18px;font-weight:700;letter-spacing:0.06em;font-family:'SFMono-Regular',Consolas,Menlo,monospace;">
            ${ticket.code}
          </p>
        </td>
      </tr>
    </table>`;
}

/**
 * `registrationUrl` is the whole recovery story. The QR images below are
 * attachments, so once someone closes the browser tab the email is the only
 * thing they still have — and without a link out of it there was no way back
 * to the registration page.
 */
export function renderTicketEmailHtml(
  payerName: string,
  tickets: TicketForEmail[],
  registrationUrl: string | null,
): string {
  const multiple = tickets.length > 1;

  return `
  <div style="background:#f5f5f4;padding:32px 16px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;margin:0 auto;">
      <tr>
        <td style="background:#0a0a0a;border-radius:20px 20px 0 0;padding:28px 28px 24px;text-align:center;">
          <p style="margin:0 0 6px;color:${ACCENT};font-size:12px;font-weight:700;letter-spacing:0.16em;">
            2026.10.10 · FINGER PRINT
          </p>
          <p style="margin:0;color:#ffffff;font-size:22px;font-weight:800;">Таны тасалбар бэлэн боллоо</p>
        </td>
      </tr>
      <tr>
        <td style="background:#ffffff;padding:28px;">
          <p style="margin:0 0 8px;color:#111111;font-size:15px;line-height:1.6;">
            Сайн байна уу, <strong>${payerName}</strong>!
          </p>
          <p style="margin:0;color:#555555;font-size:14px;line-height:1.6;">
            Төлбөр амжилттай баталгаажлаа. ${
              multiple
                ? "Доорх QR кодууд тус бүр нэг хүний тасалбар бөгөөд, "
                : "Доорх QR код таны тасалбар бөгөөд, "
            }хурлын өдөр хаалган дээр ажилтанд үзүүлнэ үү.
          </p>

          ${tickets.map(ticketCardHtml).join("")}

          <p style="margin:24px 0 0;color:#8a8a8a;font-size:12px;line-height:1.6;text-align:center;">
            Утсандаа хадгалах эсвэл хэвлэж авчрахыг зөвлөж байна.
          </p>
${
  registrationUrl
    ? `
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:20px;">
            <tr>
              <td align="center">
                <a
                  href="${registrationUrl}"
                  style="display:inline-block;background:${ACCENT};color:#000000;font-size:14px;font-weight:700;text-decoration:none;padding:13px 26px;border-radius:999px;"
                >
                  Бүртгэлээ онлайнаар харах
                </a>
                <p style="margin:12px 0 0;color:#8a8a8a;font-size:12px;line-height:1.6;">
                  Энэ имэйлээ алдвал утасны дугаараараа мөн хайж болно.
                </p>
              </td>
            </tr>
          </table>`
    : ""
}
        </td>
      </tr>
      <tr>
        <td style="background:#ffffff;border-radius:0 0 20px 20px;padding:0 28px 28px;text-align:center;">
          <p style="margin:0;color:#8a8a8a;font-size:12px;line-height:1.6;">
            Асуулт байвал бидэнтэй холбогдоно уу:
            <a href="mailto:firstchurch@gmail.com" style="color:${ACCENT};text-decoration:none;font-weight:600;">firstchurch@gmail.com</a>
          </p>
        </td>
      </tr>
    </table>
  </div>`;
}
