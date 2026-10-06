import { NextResponse } from "next/server";
import { z } from "zod";

import { isAdminAuthenticated } from "@/lib/admin/auth";
import type { CheckInResponse } from "@/lib/admin/checkIn";
import { httpErrorFor, logServerError } from "@/lib/errors";
import {
  checkInByCode,
  checkInById,
  getDoorState,
  searchAttendees,
  undoCheckIn,
} from "@/lib/registration/checkIn";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const unauthorized = () => NextResponse.json({ error: "unauthorized" }, { status: 401 });

export async function GET(request: Request) {
  if (!(await isAdminAuthenticated())) return unauthorized();

  const query = new URL(request.url).searchParams.get("q");

  try {
    if (query !== null) {
      return NextResponse.json({ hits: await searchAttendees(query.slice(0, 80)) });
    }
    return NextResponse.json(await getDoorState());
  } catch (error) {
    const { code, status } = httpErrorFor(error);
    logServerError(query !== null ? "admin.checkIn.search" : "admin.checkIn.load", error);
    return NextResponse.json({ error: code }, { status });
  }
}

const scanSchema = z.union([
  z.object({ code: z.string().min(1).max(200) }),
  z.object({ attendeeId: z.string().min(1).max(64) }),
]);

export async function POST(request: Request) {
  if (!(await isAdminAuthenticated())) return unauthorized();

  const parsed = scanSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_input" }, { status: 400 });
  }

  try {
    if ("code" in parsed.data) {
      return NextResponse.json((await checkInByCode(parsed.data.code)) satisfies CheckInResponse);
    }

    const { result, counts } = await checkInById(parsed.data.attendeeId);
    if (!result) return NextResponse.json({ error: "attendee_not_found" }, { status: 404 });
    return NextResponse.json({ result, counts } satisfies CheckInResponse);
  } catch (error) {
    const { code, status } = httpErrorFor(error);
    logServerError("admin.checkIn.scan", error);
    return NextResponse.json({ error: code }, { status });
  }
}

export async function DELETE(request: Request) {
  if (!(await isAdminAuthenticated())) return unauthorized();

  const attendeeId = new URL(request.url).searchParams.get("attendeeId");
  if (!attendeeId) {
    return NextResponse.json({ error: "invalid_input" }, { status: 400 });
  }

  try {
    const undone = await undoCheckIn(attendeeId);
    if (!undone) return NextResponse.json({ error: "attendee_not_found" }, { status: 404 });
    return NextResponse.json(undone);
  } catch (error) {
    const { code, status } = httpErrorFor(error);
    logServerError("admin.checkIn.undo", error, { attendeeId });
    return NextResponse.json({ error: code }, { status });
  }
}
