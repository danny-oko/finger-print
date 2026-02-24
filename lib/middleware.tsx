import { geolocation } from "@vercel/functions";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const geo = geolocation(request);
  const country = geo.country || "US";
  const city = geo.city || "San Francisco";

  const response = NextResponse.next();
  response.headers.set("x-user-country", country);
  console.log(country, city);
  return response;
}
