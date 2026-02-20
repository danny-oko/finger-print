"use client";

import React from "react";
import PinnedManifesto from "@/components/PinnedManifesto";
import ScrollHighlightMarquee from "@/components/ScrollHighlightMarquee";
import WhySection from "./WhySection";

const page = () => {
  return (
    <div>
      {/* <Identity /> */}
      <WhySection />
      {/* <ScrollHighlightMarquee
        chunks={[
          { type: "text", value: "Adolescence is a defining season where" },
          { type: "pill", value: "identity", tone: "mint" },
          { type: "text", value: "is shaped, where" },
          { type: "pill", value: "worth", tone: "violet" },
          { type: "text", value: "is discovered, and faith is anchored in" },
          { type: "pill", value: "Christ", tone: "orange" },
          { type: "text", value: "." },
        ]}
      /> */}
      <PinnedManifesto />
    </div>
  );
};

export default page;
