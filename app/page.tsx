import Navbar from "@/components/Navbar";
import HeroCarousel from "@/components/HeroCarousel";

export default function Page() {
  const slides = [
    {
      type: "video" as const,
      src: "https://res.cloudinary.com/doxmbmqjm/video/upload/v1770894807/Huruunii_Hee_V1_Hooloigui_ar7um2.mp4",
      poster:
        "https://res.cloudinary.com/doxmbmqjm/video/upload/so_0,f_jpg,q_auto,w_1600/Huruunii_Hee_V1_Hooloigui_ar7um2.jpg",
    },
    { type: "image" as const, src: "/fp-1.jpg", alt: "Seminar moment" },
    { type: "image" as const, src: "/fp-2.jpg", alt: "Worship" },
    { type: "image" as const, src: "/fp-3.jpg", alt: "Community" },
  ];

  return (
    <>
      <Navbar />
      <main className="mx-auto w-full">
        <HeroCarousel slides={slides} />
      </main>
    </>
  );
}
