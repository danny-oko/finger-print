import { NextResponse } from "next/server";

import { httpErrorFor, logServerError } from "@/lib/errors";
import { findTakenPhones } from "@/lib/registration/phones";
import { normalizePhone, phoneSchema } from "@/lib/registration/schema";

// Answers "is this number already attending?" for the form, so a duplicate
// surfaces under the field being typed rather than after the review dialog.
// The POST route repeats the check — this one is a courtesy, not the gate.
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

  try {
    return NextResponse.json({ taken: await findTakenPhones(phones) });
  } catch (error) {
    const { code, status } = httpErrorFor(error);
    logServerError("registration.phone_check", error, { count: phones.length });
    return NextResponse.json({ error: code }, { status });
  }
}
