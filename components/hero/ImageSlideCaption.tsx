// app/components/hero/ImageSlideCaption.tsx
"use client";

export default function ImageSlideCaption({ index }: { index: number }) {
  return (
    <div className="max-w-[520px] text-white">
      <div className="inline-flex items-center rounded-full bg-white/10 px-4 py-2 text-xs font-medium ring-1 ring-white/15">
        Gallery • Slide {index + 1}
      </div>

      <h2 className="mt-4 text-3xl font-semibold leading-tight md:text-4xl">
        A space for worship, growth, and community.
      </h2>

      <p className="mt-3 max-w-[58ch] text-sm text-white/75 md:text-base">
        Add your own caption per slide if you want (schedule highlight, theme,
        speakers, testimonies, etc).
      </p>
    </div>
  );
}
