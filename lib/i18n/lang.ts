import type { Lang } from "@/lib/translations";

export const SUPPORTED_LANGS = ["mn", "en", "ko"] as const satisfies readonly Lang[];

export const LANG_COOKIE = "fp_lang";
export const LANG_HEADER = "x-fp-lang";
export const DEFAULT_LANG: Lang = "mn";

export function isLang(value: unknown): value is Lang {
  return SUPPORTED_LANGS.includes(value as Lang);
}

export function detectLang(acceptLanguage: string | null, country: string | null): Lang {
  for (const part of (acceptLanguage ?? "").split(",")) {
    const code = part.trim().slice(0, 2).toLowerCase();
    if (isLang(code)) return code;
  }

  const region = country?.toUpperCase();
  if (region === "MN") return "mn";
  if (region === "KR") return "ko";
  if (region) return "en";

  return DEFAULT_LANG;
}
