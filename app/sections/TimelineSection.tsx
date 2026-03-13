"use client";

import JourneyClient from "@/components/Timeline/JourneyClient";

export default function TimelineSection() {
  return (
    <section id="journey" className="relative w-full py-16 md:py-20">
      <div className="mx-auto w-[min(1200px,80vw)]">
        <JourneyClient />
      </div>
    </section>
  );
}
