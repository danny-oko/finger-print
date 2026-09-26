"use client";

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/lib/useTranslation";
import { XIcon } from "lucide-react";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { useEffect } from "react";

export default function HeroVideoDialog({
  open,
  onOpenChange,
  title,
  src,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  title?: string;
  src: string;
}) {
  const { t } = useTranslation();
  const videoTitle = title ?? t("hero.videoTitle");

  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onOpenChange(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onOpenChange]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className={cn(
          "p-0 gap-0 border-0 shadow-none rounded-xl bg-transparent",
          "max-w-none sm:max-w-none",
          "w-[min(96vw,calc(86dvh*16/9),1600px)]",
        )}
      >
        <VisuallyHidden>
          <DialogTitle>{videoTitle}</DialogTitle>
        </VisuallyHidden>

        <DialogClose
          className="absolute -top-12 right-0 flex size-10 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur transition-colors hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
          aria-label={t("hero.closeVideo")}
        >
          <XIcon className="size-5" />
        </DialogClose>

        <div className="w-full aspect-video overflow-hidden rounded-xl bg-black shadow-2xl">
          <iframe
            key={open ? "open" : "closed"}
            className="h-full w-full"
            src={src}
            title={videoTitle}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
