import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const SUPPORTED_LANGS = ["en", "mn", "ko"] as const;
type Lang = typeof SUPPORTED_LANGS[number];

const LANG_COOKIE = "fp_lang";

const LANG_COOKIE_OPTS = {
  path: "/",
  maxAge: 60 * 60 * 24 * 365,
  sameSite: "lax" as const,
};

function getLangFromCountry(country: string | undefined): Lang {
  if (!country) return "en";

  const code = country.toUpperCase();
  if (code === "MN") return "mn";
  if (code === "KR") return "ko";

  return "en";
}

export function proxy(request: NextRequest) {
  const url = request.nextUrl.clone();

  const urlLang = url.searchParams.get("lang");
  if (urlLang && SUPPORTED_LANGS.includes(urlLang as Lang)) {
    const res = NextResponse.next();
    res.cookies.set(LANG_COOKIE, urlLang, LANG_COOKIE_OPTS);
    res.headers.set("x-default-lang", urlLang);
    return res;
  }

  const cookieLang = request.cookies.get(LANG_COOKIE)?.value;
  if (cookieLang && SUPPORTED_LANGS.includes(cookieLang as Lang)) {
    const rewriteUrl = request.nextUrl.clone();
    rewriteUrl.searchParams.set("lang", cookieLang);
    const res = NextResponse.rewrite(rewriteUrl);
    res.headers.set("x-default-lang", cookieLang);
    return res;
  }

  const country = request.headers.get("x-vercel-ip-country") ?? undefined;

  const defaultLang = getLangFromCountry(country);
  url.searchParams.set("lang", defaultLang);

  const response = NextResponse.redirect(url);
  response.cookies.set(LANG_COOKIE, defaultLang, LANG_COOKIE_OPTS);
  response.headers.set("x-user-country", country ?? "");
  response.headers.set("x-default-lang", defaultLang);
  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|api/|.*\\.(?:ico|png|jpg|jpeg|gif|webp|svg|woff2?)$).*)",
  ],
};
