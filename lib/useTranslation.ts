"use client";

import { useSearchParams } from "next/navigation";
import { useCallback } from "react";
import { getTranslation, type Lang } from "./translations";

export function useTranslation(): {
  lang: Lang;
  t: (key: string) => string;
} {
  const searchParams = useSearchParams();
  const lang = (searchParams.get("lang") as Lang | null) ?? "en";

  const t = useCallback((key: string) => getTranslation(lang, key), [lang]);

  return { lang, t };
}
