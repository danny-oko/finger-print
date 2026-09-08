import { NextResponse } from "next/server";
import { v4 as uuid } from "uuid";
import { z } from "zod";

import { db } from "@/lib/db/client";
import { churches } from "@/lib/db/schema";
import { httpErrorFor, logServerError } from "@/lib/errors";

export async function GET() {
  try {
    const rows = await db
      .select({ name: churches.name })
      .from(churches)
      .orderBy(churches.name)
      .limit(500)
      .all();

    return NextResponse.json({ churches: rows.map((r) => r.name) });
  } catch (error) {
    // The combobox lets people type a church that isn't listed, so an empty
    // list degrades to "type it yourself" rather than blocking the form.
    logServerError("churches.list", error, { degraded: "empty_list" });
    return NextResponse.json({ churches: [] }, { status: 200 });
  }
}

const createChurchSchema = z.object({
  name: z.string().trim().min(2, "Сүмийн нэр буруу байна").max(160),
});

// Called as soon as a user types a new church into the registration form's
// combobox, so it's saved even if they never finish/pay for a registration.
// The registration route also does a best-effort INSERT OR IGNORE at submit
// time as a fallback for anyone who reached this point before this existed.
export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = createChurchSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_input" }, { status: 400 });
  }

  try {
    await db
      .insert(churches)
      .values({ id: uuid(), name: parsed.data.name, createdAt: new Date().toISOString() })
      .onConflictDoNothing({ target: churches.name })
      .run();

    return NextResponse.json({ name: parsed.data.name });
  } catch (error) {
    const { code, status } = httpErrorFor(error);
    logServerError("churches.create", error, { name: parsed.data.name });
    return NextResponse.json({ error: code }, { status });
  }
}
