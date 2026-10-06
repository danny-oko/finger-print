import { NextResponse } from "next/server";

import { getRegistrationBootstrap } from "@/lib/registration/bootstrap";

export const runtime = "nodejs";

// Shared by everyone opening the form in the same few seconds, so a rush of
// page loads is a handful of D1 reads rather than one per person.
export async function GET() {
  return NextResponse.json(await getRegistrationBootstrap(), {
    headers: { "Cache-Control": "public, s-maxage=5, stale-while-revalidate=30" },
  });
}
