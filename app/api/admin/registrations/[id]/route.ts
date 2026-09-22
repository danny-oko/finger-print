import { NextResponse } from "next/server";

import { isAdminAuthenticated } from "@/lib/admin/auth";
import {
  cancelRegistration,
  deleteRegistration,
  MANUAL_STATUSES,
  setRegistrationStatus,
  type ManualStatus,
} from "@/lib/admin/manage";
import { httpErrorFor, logServerError } from "@/lib/errors";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = (await request.json().catch(() => null)) as
    | { action?: string; status?: string }
    | null;

  const isStatus =
    body?.action === "set_status" &&
    MANUAL_STATUSES.includes(body.status as ManualStatus);

  if (body?.action !== "cancel" && !isStatus) {
    return NextResponse.json({ error: "invalid_input" }, { status: 400 });
  }

  try {
    const result = isStatus
      ? await setRegistrationStatus(id, body!.status as ManualStatus)
      : await cancelRegistration(id);

    if (!result.ok) {
      return NextResponse.json(
        { error: result.reason },
        { status: result.reason === "registration_not_found" ? 404 : 409 },
      );
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    const { code, status } = httpErrorFor(error);
    logServerError("admin.registration.update", error, { registrationId: id });
    return NextResponse.json({ error: code }, { status });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const result = await deleteRegistration(id);

    if (!result.ok) {
      return NextResponse.json(
        { error: result.reason },
        { status: result.reason === "registration_not_found" ? 404 : 409 },
      );
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    const { code, status } = httpErrorFor(error);
    logServerError("admin.registration.delete", error, { registrationId: id });
    return NextResponse.json({ error: code }, { status });
  }
}
