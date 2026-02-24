import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const SUPPORTED_LANGS = ["en", "mn", "ko"] as const;
type Lang = (typeof SUPPORTED_LANGS)[number];

function getLangFromCountry(country: string | undefined): Lang {
  if (!country) return "en";

  const code = country.toUpperCase();
  console.log(code);
  if (code === "MN") return "mn";
  if (code === "KR") return "ko";

  return "en";
}

export function middleware(request: NextRequest) {
  const url = request.nextUrl.clone();

  console.log("middleware");
  console.log(url);

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
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico
     * - api routes
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|api/|.*\\.(?:ico|png|jpg|jpeg|gif|webp|svg|woff2?)$).*)",
  ],
};
