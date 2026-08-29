import type { Metadata } from "next";
import "./globals.css";
import { Suspense } from "react";
import Navbar from "@/components/Navbar";
import { Toaster } from "@/components/ui/sonner";
import { Analytics } from "@vercel/analytics/next";

export const metadata: Metadata = {
  title: "Finger Print",
  description: "Mongolian Christian Youth Conference",
  icons: {
    icon: "/logo.png",
  },
  openGraph: {
    title: "Finger Print",
    description: "Mongolian Christian Youth Conference",
    type: "website",
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
        <Analytics />
      </body>
    </html>
  );
}
