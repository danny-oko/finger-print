import { NextResponse } from "next/server";

import { isAdminAuthenticated } from "@/lib/admin/auth";
import { cancelRegistration, deleteRegistration } from "@/lib/admin/manage";
import { httpErrorFor, logServerError } from "@/lib/errors";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** The only supported change is cancelling — nothing else here is editable. */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = (await request.json().catch(() => null)) as { action?: string } | null;

  if (body?.action !== "cancel") {
    return NextResponse.json({ error: "invalid_input" }, { status: 400 });
  }

  try {
    const result = await cancelRegistration(id);

    if (!result.ok) {
      return NextResponse.json(
        { error: result.reason },
        { status: result.reason === "registration_not_found" ? 404 : 409 },
      );
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    const { code, status } = httpErrorFor(error);
    logServerError("admin.registration.cancel", error, { registrationId: id });
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
