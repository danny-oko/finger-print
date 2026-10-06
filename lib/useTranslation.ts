"use client";

import { useCallback } from "react";

import { useLanguage } from "@/components/LanguageProvider";
import { getTranslation, type Lang } from "./translations";

export function useTranslation(): { lang: Lang; t: (key: string) => string } {
  const { lang } = useLanguage();
  const t = useCallback((key: string) => getTranslation(lang, key), [lang]);
  return { lang, t };
}
