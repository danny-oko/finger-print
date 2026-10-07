import { NextResponse } from "next/server";

import { httpErrorFor, logServerError } from "@/lib/errors";
import { getRegistrationDetail, withIssuedTickets } from "@/lib/registration/detail";
import { reconcileThrottled } from "@/lib/registration/settle";

export const dynamic = "force-dynamic";

// Byl's webhook normally lands within seconds of paying; asking Byl
// ourselves before then just spends requests to learn the same thing.
const WEBHOOK_GRACE_MS = 30_000;

// Public, but guarded by the registration's unguessable id. Contact details
// are masked in getRegistrationDetail before they get here.
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  try {
    let registration = await getRegistrationDetail(id);

    if (!registration) {
      return NextResponse.json({ error: "not_found" }, { status: 404 });
    }

    // The page renders from the database alone so it paints immediately;
    // asking Byl what really happened costs a round trip, so it belongs here
    // on the poll instead. A payment the webhook never delivered settles on
    // the next tick rather than blocking first paint.
    // A plain transfer has nothing at Byl to ask about.
    if (
      registration.status === "pending" &&
      registration.paymentUrl &&
      Date.now() - Date.parse(registration.createdAt) > WEBHOOK_GRACE_MS
    ) {
      try {
        if (await reconcileThrottled(id)) {
          registration = (await getRegistrationDetail(id)) ?? registration;
        }
      } catch (error) {
        // The next poll retries — a Byl outage shouldn't fail the poll and
        // strand the registrant on a stale screen.
        logServerError("registration.reconcile", error, { registrationId: id });
      }
    }

    registration = await withIssuedTickets(registration);

    return NextResponse.json({ registration }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    const { code, status } = httpErrorFor(error);
    logServerError("registration.detail", error, { registrationId: id });
    return NextResponse.json({ error: code }, { status });
  }
}
