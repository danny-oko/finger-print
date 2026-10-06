import { Suspense } from "react";

import { LanguageProvider } from "@/components/LanguageProvider";
import Navbar from "@/components/Navbar";
import { getRequestLang } from "@/lib/i18n/server";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const lang = await getRequestLang();

  return (
    <LanguageProvider initialLang={lang}>
      <Suspense fallback={null}>
        <Navbar />
      </Suspense>
      {children}
    </LanguageProvider>
  );
}
