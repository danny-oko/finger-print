import { NextResponse } from "next/server";

import { httpErrorFor, logServerError } from "@/lib/errors";
import { getRegistrationDetail } from "@/lib/registration/detail";
import { reconcilePendingRegistration } from "@/lib/registration/settle";

export const dynamic = "force-dynamic";

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
    if (registration.status === "pending") {
      try {
        if (await reconcilePendingRegistration(id)) {
          registration = (await getRegistrationDetail(id)) ?? registration;
        }
      } catch (error) {
        // The next poll retries — a Byl outage shouldn't fail the poll and
        // strand the registrant on a stale screen.
        logServerError("registration.reconcile", error, { registrationId: id });
      }
    }

    return NextResponse.json({ registration });
  } catch (error) {
    const { code, status } = httpErrorFor(error);
    logServerError("registration.detail", error, { registrationId: id });
    return NextResponse.json({ error: code }, { status });
  }
}
