import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const SUPPORTED_LANGS = ["en", "mn", "ko"] as const;
type Lang = (typeof SUPPORTED_LANGS)[number];

function getLangFromCountry(country: string | undefined): Lang {
  if (!country) return "en";

  const code = country.toUpperCase();
  if (code === "MN") return "mn";
  if (code === "KR") return "ko";

  return "en";
}

export function middleware(request: NextRequest) {
  const url = request.nextUrl.clone();

  const existingLang = url.searchParams.get("lang");
  if (existingLang && SUPPORTED_LANGS.includes(existingLang as Lang)) {
    const res = NextResponse.next();
    res.headers.set("x-default-lang", existingLang);
    return res;
  }

  const country = request.headers.get("x-vercel-ip-country") ?? undefined;

  const defaultLang = getLangFromCountry(country);
  url.searchParams.set("lang", defaultLang);

  const response = NextResponse.redirect(url);
  response.headers.set("x-user-country", country ?? "");
  response.headers.set("x-default-lang", defaultLang);
  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|api/|.*\\.(?:ico|png|jpg|jpeg|gif|webp|svg|woff2?)$).*)",
  ],
};
