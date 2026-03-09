"use client";

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { useEffect } from "react";

export default function HeroVideoDialog({
  open,
  onOpenChange,
  title = "Finger Print Full Video",
  src,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  title?: string;
  src: string;
}) {
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
        className={cn(
          "p-0 border-0 shadow-none rounded-xl",
          "flex items-center justify-center",
          "w-[min(98vw,1400px)] max-h-[90vh]",
          "bg-transparent",
        )}
      >
        <VisuallyHidden>
          <DialogTitle>{title}</DialogTitle>
        </VisuallyHidden>

        <div className="w-full aspect-video overflow-hidden rounded-xl">
          <iframe
            key={open ? "open" : "closed"}
            className="h-full w-full"
            src={src}
            title={title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
