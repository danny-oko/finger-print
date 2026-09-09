import { NextResponse } from "next/server";

import { isAdminAuthenticated } from "@/lib/admin/auth";
import { adminAttendeeSchema } from "@/lib/admin/attendeeSchema";
import { deleteAttendee, updateAttendee } from "@/lib/admin/manage";
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
  const body = await request.json().catch(() => null);
  const parsed = adminAttendeeSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "invalid_input", issues: parsed.error.issues },
      { status: 400 },
    );
  }

  try {
    const result = await updateAttendee(id, parsed.data);

    if (!result.ok) {
      return NextResponse.json({ error: result.reason }, { status: 404 });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    const { code, status } = httpErrorFor(error);
    logServerError("admin.attendee.update", error, { attendeeId: id });
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
    const result = await deleteAttendee(id);

    if (!result.ok) {
      return NextResponse.json(
        { error: result.reason },
        { status: result.reason === "attendee_not_found" ? 404 : 409 },
      );
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    const { code, status } = httpErrorFor(error);
    logServerError("admin.attendee.delete", error, { attendeeId: id });
    return NextResponse.json({ error: code }, { status });
  }
}
