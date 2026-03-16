"use client";

import AttendSection from "@/app/sections/AttendSection";
import Identity from "@/app/sections/Identity";
import Projects from "@/app/sections/Projects";
import TimlineClient from "@/app/sections/ImpactTimeline.tsx";
import CountDown from "@/components/CountDown/CountDown";
import Footer from "@/components/Footer";
import Gallery from "@/components/Gallery";
import Navbar from "@/components/Navbar";
import HeroCarousel from "@/components/hero/HeroCarousel";
import { useTranslation } from "@/lib/useTranslation";
export default function HomeClient() {
  const { t } = useTranslation();

  const slides = [
    {
      type: "video" as const,
      src: "https://res.cloudinary.com/dx2oi41mo/video/upload/f_auto,q_auto,w_1280,vc_auto/v1773475306/dennig_unsne_tvvvuw.mp4",
      poster:
        "https://res.cloudinary.com/dx2oi41mo/video/upload/f_auto,q_auto,w_1280,so_0/v1773475306/dennig_unsne_tvvvuw.jpg",
    },
    { type: "image" as const, src: "/fp-4.jpg", alt: "Community" },
    { type: "image" as const, src: "/fp-2024_long.jpg", alt: "Seminar moment" },
  ];

  return (
    <>
      <Navbar />
      <main>
        <HeroCarousel slides={slides} />
        <CountDown />
        <Identity />
        <AttendSection />
        <TimlineClient />
        {/* <Projects /> */}
        <Gallery />
      </main>
      <Footer
        bigWord="FINGER PRINT"
        rightsText={t("footer.rightsText")}
        motto={t("footer.motto")}
        socials={{
          youtube: "https://youtube.com/",
          facebook: "https://www.facebook.com/huruuniihee",
          instagram: "https://www.instagram.com/huruunii_hee/",
          email: "mailto:firstchurch@gmail.com",
          phone: "tel:+8007 0177",
        }}
        navItems={[
          { label: t("nav.about"), href: "#about" },
          { label: t("nav.journey"), href: "#journey" },
          { label: t("nav.stories"), href: "#stories" },
          { label: t("nav.gallery"), href: "#gallery" },
        ]}
      />
    </>
  );
}
