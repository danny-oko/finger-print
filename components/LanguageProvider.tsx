"use client";

import { useRouter } from "next/navigation";
import * as React from "react";

import { LANG_COOKIE } from "@/lib/i18n/lang";
import type { Lang } from "@/lib/translations";

type LanguageContextValue = { lang: Lang; setLang: (next: Lang) => void };

const LanguageContext = React.createContext<LanguageContextValue | null>(null);

const ONE_YEAR = 60 * 60 * 24 * 365;

export function LanguageProvider({
  initialLang,
  children,
}: {
  initialLang: Lang;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [lang, setLangState] = React.useState(initialLang);

  React.useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const setLang = React.useCallback(
    (next: Lang) => {
      document.cookie = `${LANG_COOKIE}=${next}; path=/; max-age=${ONE_YEAR}; samesite=lax`;
      setLangState(next);
      router.refresh();
    },
    [router],
  );

  const value = React.useMemo(() => ({ lang, setLang }), [lang, setLang]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage(): LanguageContextValue {
  const value = React.useContext(LanguageContext);
  if (!value) throw new Error("useLanguage must be used inside <LanguageProvider>");
  return value;
}
