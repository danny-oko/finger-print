import { NextResponse } from "next/server";

import { httpErrorFor, logServerError } from "@/lib/errors";
import { lookupByPhone } from "@/lib/registration/lookup";
import { normalizePhone, phoneSchema } from "@/lib/registration/schema";
import { rateLimit, RATE_LIMITS, tooManyRequests } from "@/lib/server/rateLimit";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const phone = normalizePhone(new URL(request.url).searchParams.get("phone") ?? "");

  if (!phoneSchema.safeParse(phone).success) {
    return NextResponse.json({ error: "invalid_phone" }, { status: 400 });
  }

  // A number reveals the names registered under it, so stepping through
  // numbers has to be slow.
  const limited = await rateLimit(request, RATE_LIMITS.lookup);
  if (!limited.ok) return tooManyRequests(limited.retryAfterSec);

  try {
    return NextResponse.json(
      { registrations: await lookupByPhone(phone) },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    const { code, status } = httpErrorFor(error);
    // The last two digits are enough to line a report up with a log line.
    logServerError("registration.lookup", error, { phone: `••••••${phone.slice(-2)}` });
    return NextResponse.json({ error: code }, { status });
  }
}
