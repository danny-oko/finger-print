import { Onest, Unbounded } from "next/font/google";

// Both carry cyrillic-ext, which is where Mongolian's Ө and Ү live — the
// plain "cyrillic" subset would render them in a fallback face.
export const displayFont = Unbounded({
  subsets: ["cyrillic", "cyrillic-ext", "latin"],
  weight: ["500", "700", "800"],
  variable: "--font-unbounded",
  display: "swap",
});

export const uiFont = Onest({
  subsets: ["cyrillic", "cyrillic-ext", "latin"],
  variable: "--font-onest",
  display: "swap",
});
