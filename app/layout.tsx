import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { SiteAnalytics } from "@/components/SiteAnalytics";
import { displayFont, uiFont } from "@/lib/fonts";
import { EVENT } from "@/lib/event";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://finger-print.org";

const DESCRIPTION = `${EVENT.name} — өсвөрийн чуулган. 2026.10.10, ${EVENT.time}`;

export const metadata: Metadata = {
  // Without this, og:image resolves to a relative path and every chat app
  // silently drops it — which is how a shared link ends up as a cropped logo.
  metadataBase: new URL(SITE_URL),
  title: "Хурууны хээ 2026 | Finger Print",
  description: DESCRIPTION,
  icons: {
    icon: "/logo.png",
  },
  openGraph: {
    type: "website",
    siteName: "Finger Print",
    locale: "mn_MN",
    url: SITE_URL,
    title: "Хурууны хээ 2026",
    description: DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: "Хурууны хээ 2026",
    description: DESCRIPTION,
  },
};

// Mongolian is what the registration pages are written in; the marketing
// site corrects `lang` on the client once its language is known.
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="mn" className={`${displayFont.variable} ${uiFont.variable}`}>
      <body className="relative">
        {children}
        <Toaster position="top-center" richColors />
        <SiteAnalytics />
      </body>
    </html>
  );
}
