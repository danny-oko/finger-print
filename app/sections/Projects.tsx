"use client";

import { useTranslation } from "@/lib/useTranslation";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";

const videos = [
  {
    titleKey: "shortFilm" as const,
    embed:
      "https://www.youtube-nocookie.com/embed/g5Uk9WVFTt0?controls=0&modestbranding=1&rel=0&playsinline=1",
    link: "https://youtu.be/g5Uk9WVFTt0",
  },
  {
    titleKey: "eventDayVideo" as const,
    embed: "https://www.youtube.com/embed/dQw4w9WgXcQ?si=rjIuuNjaNL4eLu95",
    link: "https://youtu.be/dQw4w9WgXcQ?si=X_pUPz--ypda4mB3",
  },
];

const Projects = () => {
  const { t } = useTranslation();

  return (
    <section className="w-full" id="stories">
      <div className="mx-auto w-[min(1200px,80vw)] ">
        <div className="mb-10 flex flex-col gap-3"></div>

        <div className="grid gap-8 md:grid-cols-2">
          {videos.map((video, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0.1, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.35 }}
              transition={{
                duration: 0.3,
                ease: "easeInOut",
                delay: index * 0.04,
              }}
              className="group"
            >
              <div className="mb-3 flex items-end justify-between gap-3">
                <h3 className="text-lg font-semibold">
                  {t(`projects.${video.titleKey}`)}
                </h3>
                <motion.a
                  whileHover={{ y: -1 }}
                  whileTap={{ scale: 0.98 }}
                  href={video.link}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm flex gap-1 font-medium underline underline-offset-4 decoration-border hover:decoration-foreground"
                >
                  {t("projects.open")}
                  <ArrowUpRight size={24} strokeWidth={1} />
                </motion.a>
              </div>

              <div className="relative overflow-hidden rounded-3xl border border-border bg-background shadow-sm">
                <div className="relative aspect-video w-full">
                  <iframe
                    className="absolute inset-0 h-full w-full transition-transform duration-500 group-hover:scale-[1.01]"
                    src={video.embed}
                    title={t(`projects.${video.titleKey}`)}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    referrerPolicy="strict-origin-when-cross-origin"
                    allowFullScreen
                  />
                </div>

                <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Projects;
