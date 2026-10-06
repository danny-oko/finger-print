import { NextResponse } from "next/server";

import { joinQueue, leaveQueue, pollQueue } from "@/lib/queue/waitingRoom";
import { rateLimit, RATE_LIMITS, tooManyRequests } from "@/lib/server/rateLimit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const NO_STORE = { "Cache-Control": "no-store" };

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as { ticket?: unknown } | null;

  if (body?.ticket) {
    return NextResponse.json(await pollQueue(body.ticket), { headers: NO_STORE });
  }

  const limited = await rateLimit(request, RATE_LIMITS.queueJoin);
  if (!limited.ok) return tooManyRequests(limited.retryAfterSec);

  return NextResponse.json(await joinQueue(), { headers: NO_STORE });
}

export async function DELETE(request: Request) {
  const body = (await request.json().catch(() => null)) as { ticket?: unknown } | null;
  await leaveQueue(body?.ticket);
  return NextResponse.json({ ok: true }, { headers: NO_STORE });
}
