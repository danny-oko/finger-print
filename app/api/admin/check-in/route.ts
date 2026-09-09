import { NextResponse } from "next/server";
import { z } from "zod";

import { isAdminAuthenticated } from "@/lib/admin/auth";
import type { CheckInResponse } from "@/lib/admin/checkIn";
import { httpErrorFor, logServerError } from "@/lib/errors";
import {
  checkInByCode,
  getDoorCounts,
  getRecentCheckIns,
  undoCheckIn,
} from "@/lib/registration/checkIn";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const scanSchema = z.object({ code: z.string().min(1).max(200) });

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  try {
    const [counts, recent] = await Promise.all([getDoorCounts(), getRecentCheckIns()]);
    return NextResponse.json({ counts, recent });
  } catch (error) {
    const { code, status } = httpErrorFor(error);
    logServerError("admin.checkIn.load", error);
    return NextResponse.json({ error: code }, { status });
  }
}

/**
 * A scan is never an HTTP failure. "Not found" and "already in" are answers
 * the door needs shown on screen, so everything the scanner can hit comes
 * back 200 with an `outcome` — only a broken session or a broken database
 * gets an error status.
 */
export async function POST(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = scanSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_input" }, { status: 400 });
  }

  try {
    const result = await checkInByCode(parsed.data.code);
    const counts = await getDoorCounts();
    return NextResponse.json({ result, counts } satisfies CheckInResponse);
  } catch (error) {
    const { code, status } = httpErrorFor(error);
    logServerError("admin.checkIn.scan", error);
    return NextResponse.json({ error: code }, { status });
  }
}

export async function DELETE(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const attendeeId = new URL(request.url).searchParams.get("attendeeId");

  if (!attendeeId) {
    return NextResponse.json({ error: "invalid_input" }, { status: 400 });
  }

  try {
    const attendee = await undoCheckIn(attendeeId);

    if (!attendee) {
      return NextResponse.json({ error: "attendee_not_found" }, { status: 404 });
    }

    return NextResponse.json({ attendee, counts: await getDoorCounts() });
  } catch (error) {
    const { code, status } = httpErrorFor(error);
    logServerError("admin.checkIn.undo", error, { attendeeId });
    return NextResponse.json({ error: code }, { status });
  }
}
