import { NextResponse } from "next/server";

import { httpErrorFor, logServerError } from "@/lib/errors";
import { getRegistrationDetail } from "@/lib/registration/detail";

export const dynamic = "force-dynamic";

// Public, but guarded by the registration's unguessable id. Contact details
// are masked in getRegistrationDetail before they get here.
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  try {
    const registration = await getRegistrationDetail(id);

    if (!registration) {
      return NextResponse.json({ error: "not_found" }, { status: 404 });
    }

    return NextResponse.json({ registration });
  } catch (error) {
    const { code, status } = httpErrorFor(error);
    logServerError("registration.detail", error, { registrationId: id });
    return NextResponse.json({ error: code }, { status });
  }
}
