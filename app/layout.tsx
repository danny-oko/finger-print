import type { Metadata } from "next";
import "./globals.css";
import { Suspense } from "react";
import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
  title: "Finger Print",
  description: "Mongolian Christian Youth Event",
  openGraph: {
    title: "Finger Print",
    description: "Mongolian Christian Youth Event",
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
      </body>
    </html>
  );
}
