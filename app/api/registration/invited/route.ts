import { waitUntil } from "@vercel/functions";
import { NextResponse } from "next/server";

import { trackServerEvent } from "@/lib/analytics/server";
import { httpErrorFor, logServerError } from "@/lib/errors";
import { createInvitedRegistration } from "@/lib/registration/create";
import { isValidInviteToken } from "@/lib/registration/invite";
import { createInvitedRegistrationSchema } from "@/lib/registration/schema";
import { rateLimit, RATE_LIMITS, tooManyRequests } from "@/lib/server/rateLimit";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const limited = await rateLimit(request, RATE_LIMITS.createInvited);
  if (!limited.ok) return tooManyRequests(limited.retryAfterSec);

  const body = await request.json().catch(() => null);

  // Checked before the body so a wrong token gets the same 404 as a route
  // that doesn't exist, whatever else was sent.
  if (!isValidInviteToken((body as { token?: unknown } | null)?.token)) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  const parsed = createInvitedRegistrationSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_input", issues: parsed.error.issues }, { status: 400 });
  }

  try {
    const result = await createInvitedRegistration(parsed.data);

    if (!result.ok) {
      waitUntil(trackServerEvent("registration_create_failed", { reason: result.error }));
      return NextResponse.json({ ...result, ok: undefined }, { status: 409 });
    }

    waitUntil(trackServerEvent("registration_invited", {}));
    return NextResponse.json({ registrationId: result.registrationId });
  } catch (error) {
    const { code, status } = httpErrorFor(error);
    logServerError("registration.invited", error);
    waitUntil(trackServerEvent("registration_create_failed", { reason: code }));
    return NextResponse.json({ error: code }, { status });
  }
}
