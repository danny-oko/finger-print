import { NextResponse } from "next/server";
import { z } from "zod";

import {
  ADMIN_COOKIE,
  ADMIN_COOKIE_OPTIONS,
  createSessionToken,
  isValidAdminPassword,
} from "@/lib/admin/auth";

export const runtime = "nodejs";

const loginSchema = z.object({
  password: z.string().min(1),
});

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = loginSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_input" }, { status: 400 });
  }

  let valid: boolean;
  try {
    valid = isValidAdminPassword(parsed.data.password);
  } catch (error) {
    console.error("Admin auth is not configured", error);
    return NextResponse.json({ error: "not_configured" }, { status: 500 });
  }

  if (!valid) {
    return NextResponse.json({ error: "invalid_password" }, { status: 401 });
  }

  const session = createSessionToken();
  const response = NextResponse.json({ ok: true });

  response.cookies.set(ADMIN_COOKIE, session.value, {
    ...ADMIN_COOKIE_OPTIONS,
    maxAge: session.maxAge,
  });

  return response;
}

export async function DELETE() {
  const response = NextResponse.json({ ok: true });
  response.cookies.set(ADMIN_COOKIE, "", { ...ADMIN_COOKIE_OPTIONS, maxAge: 0 });
  return response;
}
