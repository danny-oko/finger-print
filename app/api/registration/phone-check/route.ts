import { NextResponse } from "next/server";

import { isD1UnderPressure } from "@/lib/db/d1";
import { httpErrorFor, logServerError } from "@/lib/errors";
import { findTakenPhones } from "@/lib/registration/phones";
import { normalizePhone, phoneSchema } from "@/lib/registration/schema";
import { rateLimit, RATE_LIMITS } from "@/lib/server/rateLimit";

// Answers "is this number already attending?" for the form, so a duplicate
// surfaces under the field being typed rather than after the review dialog.
// It's a courtesy, not the gate — the create route enforces the rule inside
// its own insert — so whenever answering would cost something scarcer
// (a throttled client, D1 near its rate limit) it answers "unknown" instead.
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const phones = [
    ...new Set(
      (searchParams.get("phones") ?? "")
        .split(",")
        .map((p) => normalizePhone(p))
        .filter((p) => phoneSchema.safeParse(p).success),
    ),
  ].slice(0, 50);

  if (phones.length === 0) return NextResponse.json({ taken: [] });

  const limited = await rateLimit(request, RATE_LIMITS.phoneCheck);
  if (!limited.ok || isD1UnderPressure()) {
    return NextResponse.json({ taken: [], skipped: true });
  }

  try {
    return NextResponse.json({ taken: await findTakenPhones(phones) });
  } catch (error) {
    const { code, status } = httpErrorFor(error);
    logServerError("registration.phone_check", error, { count: phones.length });
    return NextResponse.json({ error: code }, { status });
  }
}
