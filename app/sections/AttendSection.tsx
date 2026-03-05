"use client";

import AttendHeader from "@/components/attend/AttendHeader";
import AttendStack from "@/components/attend/AttendStack";
import { AttendItem } from "@/components/attend/types";

const ATTEND_ITEMS: AttendItem[] = [
  {
    id: 1,
    title: "1. Оролцох",
    body: "Өсвөрчүүдтэйгээ хамтдаа конферренцэд оролцох (хэрэв та өсвөр насны хүүхэд бол ганцаараа эсвэл найзтайгаа хамт оролцох боломжтой).",
  },
  {
    id: 2,
    title: "2. Үйлчлэлд нэгдэх",
    body: "Магтаалын баг, мэндчилгээ, зохион байгуулах багт нэгдэх.",
  },
  {
    id: 3,
    title: "3. Санхүүгийн дэмжлэг",
    body: "Санхүүгийн дэмжлэг үзүүлэх боломжтой.",
  },
];

// ─── Props ───────────────────────────────────────────────────────────────────

interface AttendSectionProps {
  /** Height of the fixed navbar in px — used for sticky + pin offsets */
  navOffset?: number;
  id?: string;
}

// ─── Section ─────────────────────────────────────────────────────────────────

export default function AttendSection({
  navOffset = 112,
  id = "attend",
}: AttendSectionProps) {
  return (
    <section
      id={id}
      className="relative w-full overflow-x-hidden"
      style={{
        background:
          "radial-gradient(ellipse 80% 60% at 60% 20%, #EEF2FF 0%, #F9FAFB 55%, #F0F4FF 100%)",
        fontFamily: "'Noto Sans', system-ui, sans-serif",
      }}
    >
      {/* Decorative blurred orbs */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        <div
          className="absolute rounded-full blur-3xl opacity-30"
          style={{
            width: 520,
            height: 520,
            top: "-120px",
            right: "-80px",
            background: "radial-gradient(circle, #818CF8 0%, transparent 70%)",
          }}
        />
        <div
          className="absolute rounded-full blur-3xl opacity-20"
          style={{
            width: 360,
            height: 360,
            bottom: "10%",
            left: "-60px",
            background: "radial-gradient(circle, #6C63FF 0%, transparent 70%)",
          }}
        />
      </div>

      {/* Inner layout */}
      <div className="relative mx-auto max-w-6xl px-5 sm:px-8 xl:px-12 py-24 lg:py-32">
        {/* ── Mobile: stacked vertically ─────────────────────────────── */}
        <div className="lg:hidden flex flex-col gap-12">
          <AttendHeader navOffset={0} />
          <div className="flex flex-col gap-6">
            {ATTEND_ITEMS.map((item, i) => (
              <div
                key={item.id}
                className="rounded-3xl border p-7 shadow-md"
                style={{
                  background: "#FFFFFF",
                  borderColor: "rgba(108,99,255,0.12)",
                  boxShadow:
                    "0 4px 6px rgba(0,0,0,0.04), 0 10px 30px rgba(0,0,0,0.07)",
                  fontFamily: "'Noto Sans', system-ui, sans-serif",
                }}
              >
                <span
                  className="inline-flex items-center justify-center w-9 h-9 rounded-xl text-sm font-bold text-white mb-5"
                  style={{
                    background:
                      "linear-gradient(135deg, #8B85FF 0%, #6C63FF 100%)",
                  }}
                >
                  {i + 1}
                </span>
                <h3
                  className="text-xl font-bold mb-3"
                  style={{
                    fontFamily:
                      "'Noto Sans Mongolian', 'Noto Sans', Georgia, serif",
                    color: "#0F0F0F",
                  }}
                >
                  {item.title}
                </h3>
                <p
                  className="text-sm leading-relaxed"
                  style={{ color: "#5A5A6E" }}
                >
                  {item.body}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* ── Desktop: two-column sticky + pinned stack ──────────────── */}
        <div className="hidden lg:grid grid-cols-[1fr_1fr] xl:grid-cols-[5fr_6fr] gap-16 xl:gap-24 items-start">
          {/* Left — sticky header */}
          <AttendHeader navOffset={navOffset} />

          {/* Right — GSAP scroll stack */}
          <AttendStack items={ATTEND_ITEMS} navOffset={navOffset} />
        </div>
      </div>
    </section>
  );
}
