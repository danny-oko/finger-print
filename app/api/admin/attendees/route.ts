import { NextResponse } from "next/server";

import { isAdminAuthenticated } from "@/lib/admin/auth";
import { addAttendeeSchema } from "@/lib/admin/attendeeSchema";
import { addAttendee } from "@/lib/admin/manage";
import { httpErrorFor, logServerError } from "@/lib/errors";
import { findTakenPhones } from "@/lib/registration/phones";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = addAttendeeSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "invalid_input", issues: parsed.error.issues },
      { status: 400 },
    );
  }

  const { registrationId, ...input } = parsed.data;

  try {
    // The same rule the public form enforces: one number, one attendee.
    if (input.phone) {
      const taken = await findTakenPhones([input.phone]);
      if (taken.length > 0) {
        return NextResponse.json({ error: "phone_taken" }, { status: 409 });
      }
    }

    const result = await addAttendee(registrationId, input);

    if (!result.ok) {
      return NextResponse.json({ error: result.reason }, { status: 409 });
    }

    return NextResponse.json({ attendeeId: result.attendeeId });
  } catch (error) {
    const { code, status } = httpErrorFor(error);
    logServerError("admin.attendee.create", error, { registrationId });
    return NextResponse.json({ error: code }, { status });
  }
}
