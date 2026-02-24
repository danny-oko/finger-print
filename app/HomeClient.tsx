"use client";

import Identity from "@/app/sections/Identity";
import TimlineClient from "@/app/sections/TimelineClient";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import HeroCarousel from "@/components/hero/HeroCarousel";
import Gallery from "@/components/Gallery";
import Projects from "@/app/sections/Projects";
import { useTranslation } from "@/lib/useTranslation";

export default function HomeClient() {
  const { t } = useTranslation();

  const slides = [
    {
      type: "video" as const,
      src: "https://res.cloudinary.com/doxmbmqjm/video/upload/v1770894807/Huruunii_Hee_V1_Hooloigui_ar7um2.mp4",
      poster:
        "https://res.cloudinary.com/doxmbmqjm/video/upload/so_0,f_jpg,q_auto,w_1600/Huruunii_Hee_V1_Hooloigui_ar7um2.jpg",
    },
    { type: "image" as const, src: "/fp-1.jpg", alt: "Seminar moment" },
    { type: "image" as const, src: "/fp-2.jpg", alt: "Worship" },
    { type: "image" as const, src: "/fp-4.jpg", alt: "Community" },
  ];

  return (
    <>
      <Navbar />
      <main>
        <HeroCarousel slides={slides} />
        <Identity />
        <TimlineClient />
        <Projects />
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
