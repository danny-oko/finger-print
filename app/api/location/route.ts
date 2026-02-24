import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const COUNTRY_TO_LANG: Record<string, string> = {
  MN: "mn",
  KR: "ko",
};
const DEFAULT_LANG = "en";

export async function GET(request: NextRequest) {
  const country =
    request.headers.get("x-vercel-ip-country") ?? "Unknown";
  const city =
    request.headers.get("x-vercel-ip-city") ?? "Unknown";
  const lang = COUNTRY_TO_LANG[country.toUpperCase()] ?? DEFAULT_LANG;

  return NextResponse.json({
    country,
    city,
    lang,
  });
}
