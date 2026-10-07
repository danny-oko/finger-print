import { waitUntil } from "@vercel/functions";
import { NextResponse } from "next/server";

import { trackServerEvent } from "@/lib/analytics/server";
import { httpErrorFor, logServerError } from "@/lib/errors";
import { checkPass } from "@/lib/queue/waitingRoom";
import { createRegistration } from "@/lib/registration/create";
import { createRegistrationSchema } from "@/lib/registration/schema";
import { rateLimit, RATE_LIMITS, tooManyRequests } from "@/lib/server/rateLimit";

export const runtime = "nodejs";

const STATUS: Record<string, number> = {
  phone_taken: 409,
  sold_out: 409,
  transfer_pending: 409,
  registration_closed: 403,
  registration_paused: 503,
  payment_error: 502,
};

export async function POST(request: Request) {
  const limited = await rateLimit(request, RATE_LIMITS.createRegistration);
  if (!limited.ok) return tooManyRequests(limited.retryAfterSec);

  const parsed = createRegistrationSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_input", issues: parsed.error.issues }, { status: 400 });
  }
  const input = parsed.data;

  const pass = await checkPass(request.headers.get("x-queue-pass"), input.idempotencyKey);
  if (!pass.ok) {
    return NextResponse.json({ error: "queue_required", reason: pass.reason }, { status: 428 });
  }

  try {
    const result = await createRegistration(input, { origin: new URL(request.url).origin });

    if (!result.ok) {
      waitUntil(trackServerEvent("registration_create_failed", { reason: result.error }));
      return NextResponse.json({ ...result, ok: undefined }, { status: STATUS[result.error] ?? 400 });
    }

    // The client's own "submitted" event fires before this request and can
    // be lost to the payment redirect, so this is the reliable top of the
    // funnel: a row exists and Byl has something to pay against it.
    waitUntil(
      trackServerEvent("registration_created", {
        attendees: input.attendees.length,
        registrantType: input.registrantType,
        paymentMethod: input.paymentMethod,
      }),
    );

    return NextResponse.json({ registrationId: result.registrationId, paymentUrl: result.paymentUrl });
  } catch (error) {
    const { code, status } = httpErrorFor(error);
    logServerError("registration.create", error, {
      attendees: input.attendees.length,
      registrantType: input.registrantType,
    });
    waitUntil(trackServerEvent("registration_create_failed", { reason: code }));
    return NextResponse.json({ error: code }, { status });
  }
}
