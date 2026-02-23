"use client";

import React from "react";
import PinnedManifesto from "@/components/PinnedManifesto";
import ScrollHighlightMarquee from "@/components/ScrollHighlightMarquee";
import WhySection from "./WhySection";

const page = () => {
  return (
    <div id="about">
      <WhySection />
      <PinnedManifesto />
    </div>
  );
};

export default page;
