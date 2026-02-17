export type Slide =
  | { type: "video"; src: string; poster?: string }
  | { type: "image"; src: string; alt: string };

export const YT_EMBED =
  "https://www.youtube.com/embed/g5Uk9WVFTt0?autoplay=1&rel=0&modestbranding=1";

export const heroCopy = {
  badge: "Since 2017 • 5 Editions",
  title: "Finger Print",
  subtitle: "Teen Seminar for Mongolian Churches",
  description:
    "Supporting and connecting youth ministries across Mongolia’s Evangelical churches—helping every teen discover their unique, God-given identity.",
  ctaPrimary: "	Watch Short Film",
  ctaSecondary: "Get In Touch",
};

export const CONTAINER = "mx-auto w-[80vw] max-w-[1280px]";
