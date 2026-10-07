import { NextResponse } from "next/server";
import { z } from "zod";

import { isAdminAuthenticated } from "@/lib/admin/auth";
import { httpErrorFor, logServerError } from "@/lib/errors";
import {
  drawWinner,
  getLotteryState,
  LotteryPoolEmptyError,
  removeWinner,
} from "@/lib/lottery/draw";
import { PRIZE_MAX_LENGTH, type DrawResponse } from "@/lib/lottery/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const unauthorized = () => NextResponse.json({ error: "unauthorized" }, { status: 401 });

export async function GET() {
  if (!(await isAdminAuthenticated())) return unauthorized();

  try {
    return NextResponse.json(await getLotteryState());
  } catch (error) {
    const { code, status } = httpErrorFor(error);
    logServerError("admin.lottery.load", error);
    return NextResponse.json({ error: code }, { status });
  }
}

const drawSchema = z.object({
  prize: z.string().trim().max(PRIZE_MAX_LENGTH).optional(),
});

export async function POST(request: Request) {
  if (!(await isAdminAuthenticated())) return unauthorized();

  const parsed = drawSchema.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_input" }, { status: 400 });
  }

  try {
    const drawn = await drawWinner(parsed.data.prize || null);
    return NextResponse.json(drawn satisfies DrawResponse);
  } catch (error) {
    if (error instanceof LotteryPoolEmptyError) {
      return NextResponse.json({ error: "lottery_pool_empty" }, { status: 409 });
    }
    const { code, status } = httpErrorFor(error);
    logServerError("admin.lottery.draw", error);
    return NextResponse.json({ error: code }, { status });
  }
}

export async function DELETE(request: Request) {
  if (!(await isAdminAuthenticated())) return unauthorized();

  const winnerId = new URL(request.url).searchParams.get("id");
  if (!winnerId) {
    return NextResponse.json({ error: "invalid_input" }, { status: 400 });
  }

  try {
    const state = await removeWinner(winnerId);
    if (!state) return NextResponse.json({ error: "winner_not_found" }, { status: 404 });
    return NextResponse.json(state);
  } catch (error) {
    const { code, status } = httpErrorFor(error);
    logServerError("admin.lottery.remove", error, { winnerId });
    return NextResponse.json({ error: code }, { status });
  }
}
