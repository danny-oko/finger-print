import { NextResponse } from "next/server";

import { isAdminAuthenticated } from "@/lib/admin/auth";
import { deleteRegistrations, findStaleUnpaid } from "@/lib/admin/manage";
import { httpErrorFor, logServerError } from "@/lib/errors";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const DEFAULT_HOURS = 24;
const MAX_DELETE = 200;

/** What a cleanup would remove, so the dashboard can show it before asking. */
export async function GET(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const hours = Number(
    new URL(request.url).searchParams.get("hours") ?? DEFAULT_HOURS,
  );

  try {
    const stale = await findStaleUnpaid(
      Number.isFinite(hours) && hours >= 0 ? hours : DEFAULT_HOURS,
    );
    return NextResponse.json({ registrations: stale });
  } catch (error) {
    const { code, status } = httpErrorFor(error);
    logServerError("admin.cleanup.preview", error, {});
    return NextResponse.json({ error: code }, { status });
  }
}

export async function POST(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as
    | { ids?: unknown }
    | null;

  const ids = Array.isArray(body?.ids)
    ? body.ids.filter((id): id is string => typeof id === "string").slice(0, MAX_DELETE)
    : [];

  if (ids.length === 0) {
    return NextResponse.json({ error: "invalid_input" }, { status: 400 });
  }

  try {
    const deleted = await deleteRegistrations(ids);
    return NextResponse.json({ deleted });
  } catch (error) {
    const { code, status } = httpErrorFor(error);
    logServerError("admin.cleanup.delete", error, { requested: ids.length });
    return NextResponse.json({ error: code }, { status });
  }
}
