import QRCode from "qrcode";

export const runtime = "nodejs";

const TICKET_CODE_PATTERN = /^FP-[A-Z0-9]{4}-[A-Z0-9]{4}$/;

// Renders a QR image for a ticket code. No DB lookup needed — the QR simply
// encodes the code text itself, so this just re-renders what the code
// already says. Rendering a code you already know isn't new information;
// the future admin scanner is what actually checks it against a real ticket.
export async function GET(_request: Request, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;

  if (!TICKET_CODE_PATTERN.test(code)) {
    return new Response("Not found", { status: 404 });
  }

  const png = await QRCode.toBuffer(code, { width: 320, margin: 1 });

  return new Response(new Uint8Array(png), {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
