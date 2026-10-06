import { cookies, headers } from "next/headers";

import { DEFAULT_LANG, isLang, LANG_COOKIE, LANG_HEADER } from "@/lib/i18n/lang";
import type { Lang } from "@/lib/translations";

export async function getRequestLang(): Promise<Lang> {
  const fromHeader = (await headers()).get(LANG_HEADER);
  if (isLang(fromHeader)) return fromHeader;

  const fromCookie = (await cookies()).get(LANG_COOKIE)?.value;
  return isLang(fromCookie) ? fromCookie : DEFAULT_LANG;
}
