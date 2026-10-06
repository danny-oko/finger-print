import { NextResponse } from "next/server";
import { z } from "zod";

import { httpErrorFor, logServerError } from "@/lib/errors";
import { addChurch, listChurches } from "@/lib/registration/churches";
import { rateLimit, RATE_LIMITS, tooManyRequests } from "@/lib/server/rateLimit";

export async function GET() {
  try {
    return NextResponse.json(
      { churches: await listChurches() },
      { headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" } },
    );
  } catch (error) {
    // The combobox lets people type a church that isn't listed, so an empty
    // list degrades to "type it yourself" rather than blocking the form.
    logServerError("churches.list", error, { degraded: "empty_list" });
    return NextResponse.json({ churches: [] });
  }
}

const createChurchSchema = z.object({
  name: z.string().trim().min(2).max(160),
});

export async function POST(request: Request) {
  const limited = await rateLimit(request, RATE_LIMITS.addChurch);
  if (!limited.ok) return tooManyRequests(limited.retryAfterSec);

  const parsed = createChurchSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_input" }, { status: 400 });
  }

  try {
    await addChurch(parsed.data.name);
    return NextResponse.json({ name: parsed.data.name });
  } catch (error) {
    const { code, status } = httpErrorFor(error);
    logServerError("churches.create", error);
    return NextResponse.json({ error: code }, { status });
  }
}
