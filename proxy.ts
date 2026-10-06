import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { detectLang, isLang, LANG_COOKIE, LANG_HEADER } from "@/lib/i18n/lang";

const LANG_COOKIE_OPTS = {
  path: "/",
  maxAge: 60 * 60 * 24 * 365,
  sameSite: "lax" as const,
};

export function proxy(request: NextRequest) {
  const fromQuery = request.nextUrl.searchParams.get("lang");

  if (fromQuery !== null) {
    const clean = request.nextUrl.clone();
    clean.searchParams.delete("lang");
    const response = NextResponse.redirect(clean);
    if (isLang(fromQuery)) response.cookies.set(LANG_COOKIE, fromQuery, LANG_COOKIE_OPTS);
    return response;
  }

  const fromCookie = request.cookies.get(LANG_COOKIE)?.value;
  const lang = isLang(fromCookie)
    ? fromCookie
    : detectLang(request.headers.get("accept-language"), request.headers.get("x-vercel-ip-country"));

  const headers = new Headers(request.headers);
  headers.set(LANG_HEADER, lang);
  const response = NextResponse.next({ request: { headers } });

  if (!isLang(fromCookie)) response.cookies.set(LANG_COOKIE, lang, LANG_COOKIE_OPTS);
  return response;
}

// Only the translated marketing site needs a language. Registration,
// invite and admin pages are Mongolian-only, so they skip this entirely.
export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|api/|admin/|event/|invited/|invite|come|.*opengraph-image|.*twitter-image|.*\\.(?:ico|png|jpg|jpeg|gif|webp|svg|woff2?|mp4)$).*)",
  ],
};
