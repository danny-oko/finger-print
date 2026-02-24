import { geolocation } from "@vercel/functions";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const geo = geolocation(request);
  const city = geo.city || "Unknown City";
  const country = geo.country || "Unknown Country";

  console.log(`User from: ${city}, ${country}`);
  return NextResponse.json({ city, country });
}
