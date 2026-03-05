"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import AttendHeader from "@/components/attend/AttendHeader";
import AttendStack from "@/components/attend/AttedStack";
import type { AttendItem } from "@/components/attend/types";

const CONTAINER = "mx-auto w-[min(calc(100%-2rem),80vw,1200px)]";

const ATTEND_ITEMS: AttendItem[] = [
  {
    title: "1. Оролцох",
    desc: "Өсвөрчүүдтэйгээ хамтдаа конферренцэд оролцох (хэрэв та өсвөр насны хүүхэд бол ганцаараа эсвэл найзтайгаа хамт оролцох боломжтой).",
  },
  {
    title: "2. Үйлчлэлд нэгдэх",
    desc: "Магтаалын баг, мэндчилгээ, зохион байгуулах багт нэгдэх.",
  },
  {
    title: "3. Санхүүгийн дэмжлэг",
    desc: "Санхүүгийн дэмжлэг үзүүлэх боломжтой. Action buttons redirects to contact section.",
  },
];

export default function AttendSection({
  className,
  contactHref = "#contact",
}: {
  className?: string;
  contactHref?: string;
}) {
  return (
    <section className={cn("w-full bg-white", className)} id="attend">
      <div className={cn(CONTAINER, "py-16 sm:py-20")}>
        <div className="grid gap-10 md:grid-cols-[360px_1fr] md:items-start">
          <AttendHeader contactHref={contactHref} />

          {/* ✅ make right column align nicely */}
          <div className="relative">
            <AttendStack items={ATTEND_ITEMS} navOffset={120} />
          </div>
        </div>
      </div>
    </section>
  );
}
