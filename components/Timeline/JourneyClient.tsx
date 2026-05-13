"use client";

import { getTranslations } from "@/lib/translations";
import { useTranslation } from "@/lib/useTranslation";
import { cn } from "@/lib/utils";
import { useScroll, useTransform } from "framer-motion";
import * as React from "react";

import JourneyHeader from "./JourneyHeader";
import type { JourneyCardItem } from "./JourneyItem";
import JourneyTimeline from "./JourneyTimeline";

const images = {
  sixteen: [
    "https://res.cloudinary.com/doxmbmqjm/image/upload/v1778498420/DSCN6504_w0cgkd.jpg",
    "https://res.cloudinary.com/doxmbmqjm/image/upload/v1778498420/DSCN6472_gszj1a.jpg",
    "https://res.cloudinary.com/doxmbmqjm/image/upload/v1778498421/DSCN6451_lwm5bh.jpg",
    "https://res.cloudinary.com/doxmbmqjm/image/upload/v1778498425/DSCN6521_lthiai.jpg",
    "https://res.cloudinary.com/doxmbmqjm/image/upload/v1778498426/DSCN6497_kg7yms.jpg",
    "https://res.cloudinary.com/doxmbmqjm/image/upload/v1778498428/DSCN6484_seduod.jpg",
    "https://res.cloudinary.com/doxmbmqjm/image/upload/v1778498430/DSCN6579_tcut0i.jpg",
    "https://res.cloudinary.com/doxmbmqjm/image/upload/v1778498431/DSCN6674_eqfoyp.jpg",
    "https://res.cloudinary.com/doxmbmqjm/image/upload/v1778498433/DSCN6475_hzdfsf.jpg",
    "https://res.cloudinary.com/doxmbmqjm/image/upload/v1778498435/DSCN6454_u7jlfk.jpg",
    "https://res.cloudinary.com/doxmbmqjm/image/upload/v1778498436/DSCN6822_bnq4qs.jpg",
    "https://res.cloudinary.com/doxmbmqjm/image/upload/v1778498437/DSCN6761_idmjpc.jpg",
    "https://res.cloudinary.com/doxmbmqjm/image/upload/v1778498437/DSCN6841_gldta7.jpg",
    "https://res.cloudinary.com/doxmbmqjm/image/upload/v1778498437/DSCN6831_zyhswx.jpg",
    "https://res.cloudinary.com/doxmbmqjm/image/upload/v1778498440/DSCN6843_sjyoii.jpg",
    "https://res.cloudinary.com/doxmbmqjm/image/upload/v1778498441/DSCN6844_npmo4w.jpg",
  ],
  seventeen: [
    "https://res.cloudinary.com/doxmbmqjm/image/upload/v1778498634/2017_b2jtf7.jpg",
  ],
  eighteen: [
    "https://res.cloudinary.com/doxmbmqjm/image/upload/v1778498692/4_xhiopl.jpg",
    "https://res.cloudinary.com/doxmbmqjm/image/upload/v1778498693/6_ybh96w.jpg",
    "https://res.cloudinary.com/doxmbmqjm/image/upload/v1778498693/7_n156ub.jpg",
    "https://res.cloudinary.com/doxmbmqjm/image/upload/v1778498693/5_uvx2xh.jpg",
    "https://res.cloudinary.com/doxmbmqjm/image/upload/v1778498693/8_miknvf.jpg",
    "https://res.cloudinary.com/doxmbmqjm/image/upload/v1778498694/38712079_2111501569064322_3345417801438330880_n_emtdmb.jpg",
    "https://res.cloudinary.com/doxmbmqjm/image/upload/v1778498902/fp-2019_yucqlx.jpg",
  ],
  nineteen: [
    "https://res.cloudinary.com/doxmbmqjm/image/upload/v1778635869/2019_dmwmvo.jpg",
  ],
  twentyFour: [
    "https://res.cloudinary.com/doxmbmqjm/image/upload/v1778499132/fp-61_kas0xu.jpg",
    "https://res.cloudinary.com/doxmbmqjm/image/upload/v1778499134/fp-62_du7rv8.jpg",
  ],
  twentyFive: [
    "https://res.cloudinary.com/doxmbmqjm/image/upload/v1778499015/fp-4_icoj0w.jpg",
    "https://res.cloudinary.com/doxmbmqjm/image/upload/v1778499025/fp-7_npftd7.jpg",
    "https://res.cloudinary.com/doxmbmqjm/image/upload/v1778499094/fp-35_mmfaxg.jpg",
    "https://res.cloudinary.com/doxmbmqjm/image/upload/v1778499030/fp-9_hdf2lt.jpg",
    "https://res.cloudinary.com/doxmbmqjm/image/upload/v1778499062/fp-19_qiuflc.jpg",
    "https://res.cloudinary.com/doxmbmqjm/image/upload/v1778499075/fp-27_qkwtg3.jpg",
    "https://res.cloudinary.com/doxmbmqjm/image/upload/v1778499082/fp-28_ofsolm.jpg",
    "https://res.cloudinary.com/doxmbmqjm/image/upload/v1778499108/fp-56_xwd8jr.jpg",
  ],
} as const;

const CONTAINER = "mx-auto w-full max-w-[1200px] px-4 sm:px-6";

export default function JourneyClient({ className }: { className?: string }) {
  const sectionRef = React.useRef<HTMLElement | null>(null);

  const { lang, t } = useTranslation();
  const tr = getTranslations(lang);

  const defaultItems: JourneyCardItem[] = [
    {
      year: "2016",
      title: tr.journey.title1,
      summary: tr.journey.summary1,
      pills: [
        tr.journey.pillsAttendees1,
        tr.journey.pillsServants1 ?? tr.journey.pillsVolunteers1,
      ],
      images: [...images.sixteen],
    },
    {
      year: "2017",
      title: tr.journey.title2,
      summary: tr.journey.summary2,
      pills: [
        tr.journey.pillsAttendees2,
        tr.journey.pillsServants2 ?? tr.journey.pillsVolunteers2,
      ],
      images: [...images.seventeen],
    },
    {
      year: "2018",
      title: tr.journey.title3,
      summary: tr.journey.summary3,
      pills: [
        tr.journey.pillsAttendees3,
        tr.journey.pillsServants3 ?? tr.journey.pillsVolunteers3,
      ],
      images: [...images.eighteen],
    },
    {
      year: "2019",
      title: tr.journey.title4,
      summary: tr.journey.summary4,
      pills: [
        tr.journey.pillsAttendees4,
        tr.journey.pillsServants4 ?? tr.journey.pillsVolunteers4,
      ],
      images: [...images.nineteen],
    },
    {
      year: "2024",
      title: tr.journey.title5,
      summary: tr.journey.summary5,
      pills: [
        tr.journey.pillsAttendees5,
        tr.journey.pillsServants4 ?? tr.journey.pillsVolunteers5,
      ],
      images: [...images.twentyFour],
    },
    {
      year: "2025",
      title: tr.journey.title6,
      summary: tr.journey.summary6,
      pills: [
        tr.journey.pillsAttendees6,
        tr.journey.pillsServants6 ?? tr.journey.pillsVolunteers6,
        // tr.journey.pillsChurches6,
      ],
      images: [...images.twentyFive],
    },
  ];

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start 0.85", "end 0.2"],
  });

  const lineScaleY = useTransform(scrollYProgress, [0, 1], [0, 1]);

  return (
    <section
      ref={sectionRef}
      className={cn(
        "relative w-full min-w-0 overflow-x-hidden bg-white",
        className,
      )}
    >
      <div className={cn(CONTAINER, "py-20 md:py-28")}>
        <div className="grid min-w-0 grid-cols-1 gap-10 md:grid-cols-[320px_1fr] md:gap-14">
          <JourneyHeader />

          <JourneyTimeline items={defaultItems} lineScaleY={lineScaleY} />
        </div>
      </div>
    </section>
  );
}
