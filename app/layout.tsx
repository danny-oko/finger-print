import type { Metadata } from "next";
import "./globals.css";
import { Suspense } from "react";
import Navbar from "@/components/Navbar";
import { Toaster } from "@/components/ui/sonner";
import { Analytics } from "@vercel/analytics/next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://finger-print.org";

const DESCRIPTION =
  "Хурууны хээ 2026 — залуучуудын чуулган. 2026.10.10, 09:00–17:00. Онлайнаар бүртгүүлээрэй.";

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
    // Large card rather than a thumbnail beside the text.
    card: "summary_large_image",
    title: "Хурууны хээ 2026",
    description: DESCRIPTION,
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="relative">
        <Suspense fallback={null}>
          <Navbar />
        </Suspense>
        {children}
        <Toaster position="top-center" richColors />
        <Analytics debug={false} />
      </body>
    </html>
  );
}
