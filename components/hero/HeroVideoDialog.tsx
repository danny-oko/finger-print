// app/components/hero/HeroVideoDialog.tsx
"use client";

import { cn } from "@/lib/utils";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

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
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          "p-0 border-0 shadow-none rounded-xl",
          "flex items-center justify-center",
          "w-[min(96vw,1100px)]",
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
