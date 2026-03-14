import { Suspense } from "react";

import AttendSection from "@/app/sections/AttendSection";
import Identity from "@/app/sections/Identity";
import Projects from "@/app/sections/Projects";
import TimelineSection from "@/app/sections/TimelineSection";
import CountDown from "@/components/CountDown/CountDown";
import Footer from "@/components/Footer";
import Gallery from "@/components/Gallery";
import HeroCarousel from "@/components/hero/HeroCarousel";
import type { Lang } from "@/lib/translations";

const HERO_SLIDES = [
  {
    type: "video" as const,
    src: "https://res.cloudinary.com/dx2oi41mo/video/upload/f_auto,q_auto,w_1280,vc_auto/v1773475306/dennig_unsne_tvvvuw.mp4",
    poster:
      "https://res.cloudinary.com/dx2oi41mo/video/upload/f_auto,q_auto,w_1280,so_0/v1773475306/dennig_unsne_tvvvuw.jpg",
  },
  { type: "image" as const, src: "/fp-4.jpg", alt: "Community" },
  { type: "image" as const, src: "/fp-2024_long.jpg", alt: "Seminar moment" },
];

const FOOTER_SOCIALS = {
  youtube: "https://youtube.com/",
  facebook: "https://www.facebook.com/huruuniihee",
  instagram: "https://www.instagram.com/huruunii_hee/",
  email: "mailto:firstchurch@gmail.com",
  phone: "tel:+8007 0177",
};

function SectionFallback({ className }: { className?: string }) {
  return <div className={className ?? "min-h-[120px]"} aria-hidden />;
}

const SUPPORTED_LANGS = ["en", "mn", "ko"] as const;
function parseLang(lang: string | null): Lang {
  if (lang && SUPPORTED_LANGS.includes(lang as Lang)) return lang as Lang;
  return "en";
}

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ lang?: string }>;
}) {
  const params = await searchParams;
  const lang = parseLang(params.lang ?? null);

  return (
    <>
      <main>
        <Suspense fallback={<SectionFallback className="min-h-[90vh]" />}>
          <HeroCarousel slides={HERO_SLIDES} lang={lang} />
        </Suspense>
        <Suspense fallback={<SectionFallback />}>
          <CountDown />
        </Suspense>
        <Suspense fallback={<SectionFallback className="min-h-[200px]" />}>
          <Identity />
        </Suspense>
        <Suspense fallback={<SectionFallback className="min-h-[320px]" />}>
          <AttendSection />
        </Suspense>
        <Suspense fallback={<SectionFallback className="min-h-[400px]" />}>
          <TimelineSection />
        </Suspense>
        <Suspense fallback={<SectionFallback className="min-h-[400px]" />}>
          <Projects />
        </Suspense>
        <Suspense fallback={<SectionFallback className="min-h-[300px]" />}>
          <Gallery />
        </Suspense>
      </main>
      <Suspense fallback={<SectionFallback className="min-h-[200px]" />}>
        <Footer
          bigWord="FINGER PRINT"
          socials={FOOTER_SOCIALS}
        />
      </Suspense>
    </>
  );
}
