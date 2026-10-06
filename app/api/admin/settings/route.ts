import { NextResponse } from "next/server";
import { z } from "zod";

import { isAdminAuthenticated } from "@/lib/admin/auth";
import { httpErrorFor, logServerError } from "@/lib/errors";
import { getQueueConfig, getQueueStats } from "@/lib/queue/waitingRoom";
import { getAvailability, invalidateSeats } from "@/lib/registration/availability";
import {
  getRegistrationSettings,
  QUEUE_MODES,
  REGISTRATION_STATES,
  updateRegistrationSettings,
} from "@/lib/registration/settings";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function snapshot() {
  invalidateSeats();
  const [settings, availability, queue, queueStats] = await Promise.all([
    getRegistrationSettings(),
    getAvailability(),
    getQueueConfig(),
    getQueueStats().catch(() => null),
  ]);
  return { settings, availability, queue, queueStats };
}

export type AdminSettingsResponse = Awaited<ReturnType<typeof snapshot>>;

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  try {
    return NextResponse.json(await snapshot());
  } catch (error) {
    const { code, status } = httpErrorFor(error);
    logServerError("admin.settings.load", error);
    return NextResponse.json({ error: code }, { status });
  }
}

const patchSchema = z.object({
  state: z.enum(REGISTRATION_STATES).optional(),
  capacity: z.number().int().min(1).max(100_000).nullable().optional(),
  queue: z
    .object({
      mode: z.enum(QUEUE_MODES).optional(),
      admitPerMinute: z.number().int().min(1).max(600).optional(),
      burst: z.number().int().min(1).max(200).optional(),
    })
    .optional(),
});

export async function PATCH(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const parsed = patchSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_input" }, { status: 400 });
  }

  try {
    await updateRegistrationSettings(parsed.data);
    return NextResponse.json(await snapshot());
  } catch (error) {
    const { code, status } = httpErrorFor(error);
    logServerError("admin.settings.save", error);
    return NextResponse.json({ error: code }, { status });
  }
}
