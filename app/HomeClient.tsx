"use client";

import Navbar from "@/components/Navbar";
import HeroCarousel from "@/components/hero/HeroCarousel";
import Identity from "@/app/sections/identity/page";
import TimlineClient from "@/app/sections/impact/TimelineClient";
import Footer from "@/components/Footer";

export default function HomeClient() {
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
      <HeroCarousel slides={slides} />
      <Identity />
      <TimlineClient />
      <Footer
        bigWord="FINGER PRINT"
        rightsText="All rights reserved © FirstChurch"
        motto="A shared space of worship, growth, and community—helping teens discover identity and God-given value in Christ."
        socials={{
          youtube: "https://youtube.com/@yourchannel",
          facebook: "https://facebook.com/yourpage",
          instagram: "https://instagram.com/yourpage",
          email: "mailto:firstchurch@gmail.com",
          phone: "tel:+97699112233",
        }}
        nav={[
          { label: "About", href: "#about" },
          { label: "Our Vision", href: "#our-vision" },
          { label: "Impacts", href: "#impact" },
          { label: "Contact", href: "/start" },
        ]}
      />
    </>
  );
}
