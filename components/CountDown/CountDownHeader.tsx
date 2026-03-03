"use client";

import * as React from "react";
import { Badge } from "@/components/ui/badge";
import ShinyText from "../ShinyText";

export default function CountDownHeader() {
  return (
    <div className="mb-10 text-center">
      <div className="mb-4 flex justify-center">
        <Badge className=" rounded-full bg-[#F98C01] text-black px-5 py-1.5 text-sm font-semibold tracking-tight shadow-[0_0_50px_rgba(249,140,1,0.35)] ">
          October 3rd, 2026
        </Badge>
      </div>

      <h2 className="text-3xl font-black text-white sm:text-5xl">
        Finger Print 2026
      </h2>

      <div className="mt-3 flex justify-center">
        <ShinyText
          text="✨ Is Happening In"
          speed={2}
          delay={0}
          color="#b5b5b5"
          shineColor="#ffffff"
          spread={120}
          direction="left"
          yoyo={false}
          pauseOnHover={false}
          disabled={false}
        />
      </div>
    </div>
  );
}
