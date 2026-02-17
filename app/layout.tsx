import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Finger Print",
  description: "Mongolian Christian Youth Event",
  openGraph: {
    title: "Finger Print",
    description: "Mongolian Christian Youth Event",
    type: "website",
    images: [
      {
        url: "/og.jpg",
        width: 1200,
        height: 630,
        alt: "Finger Print hero preview",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Finger Print",
    description: "Mongolian Christian Youth Event",
    images: ["/og.jpg"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
