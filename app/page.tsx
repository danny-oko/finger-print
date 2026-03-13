import { Suspense } from "react";

import AttendSection from "@/app/sections/AttendSection";
import Identity from "@/app/sections/Identity";
import Projects from "@/app/sections/Projects";
import TimelineSection from "@/app/sections/TimelineSection";
import CountDown from "@/components/CountDown/CountDown";
import Footer from "@/components/Footer";
import Gallery from "@/components/Gallery";
import HeroCarousel from "@/components/hero/HeroCarousel";

const HERO_SLIDES = [
  {
    type: "video" as const,
    src: "https://res.cloudinary.com/doxmbmqjm/video/upload/v1770894807/Huruunii_Hee_V1_Hooloigui_ar7um2.mp4",
    poster:
      "https://res.cloudinary.com/doxmbmqjm/video/upload/so_0,f_jpg,q_auto,w_1600/Huruunii_Hee_V1_Hooloigui_ar7um2.jpg",
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

export default function Page() {
  return (
    <>
      <main>
        <Suspense fallback={<SectionFallback className="min-h-[90vh]" />}>
          <HeroCarousel slides={HERO_SLIDES} />
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
