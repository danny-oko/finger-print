"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import * as React from "react";

import { trackEvent } from "@/lib/analytics/client";

const NOPE_LABELS = [
  "Үгүй",
  "Итгэлтэй байна уу?",
  "Дахиад нэг бодоод үз дээ",
  "Үнэхээр үү?",
  "За чи л дээ...",
];

// Fixed hops rather than random ones: they have to stay inside the card on a
// phone, and never land on top of the yes button.
const HOPS = [
  { x: 0, y: 0 },
  { x: 88, y: 4 },
  { x: -92, y: 8 },
  { x: 70, y: 2 },
  { x: 81, y: 2 },
];

export function InviteAnswer() {
  const [nopes, setNopes] = React.useState(0);
  const gaveUp = nopes >= NOPE_LABELS.length;

  const dodge = () => setNopes((n) => n + 1);

  return (
    <div className="mt-4 flex flex-col items-center gap-1 short:mt-3">
      <motion.div
        animate={{ scale: 1 + Math.min(nopes, NOPE_LABELS.length) * 0.04 }}
        transition={{ type: "spring", stiffness: 300, damping: 14 }}
        className="w-full"
      >
        <Link
          href="/event/registration"
          onClick={() => trackEvent("come_yes", { nopes })}
          className="flex h-13 w-full items-center justify-center gap-2 rounded-full border-2 border-[#14161A] bg-[#F98C01] text-lg font-black short:h-11 short:text-base text-[#14161A] shadow-[4px_4px_0_#14161A] transition-[transform,box-shadow] hover:-translate-y-0.5 hover:shadow-[5px_6px_0_#14161A] active:translate-y-0.5 active:shadow-[2px_2px_0_#14161A]"
        >
          {gaveUp ? "За за, явъя!" : "Тийм, явъя!"}
          <Image
            src="/come/party.gif"
            alt=""
            width={32}
            height={32}
            unoptimized
            className="size-8 short:size-7"
          />
        </Link>
      </motion.div>

      {gaveUp ? (
        <p className="py-1.5 text-sm font-semibold text-neutral-500">
          Зүгээр л тоглосон юм 😄 Хамтдаа явна шүү!
        </p>
      ) : (
        <motion.button
          type="button"
          animate={HOPS[nopes]}
          transition={{ type: "spring", stiffness: 420, damping: 18 }}
          onPointerEnter={(e) => {
            if (e.pointerType === "mouse") dodge();
          }}
          onClick={dodge}
          className="rounded-full px-4 py-1.5 text-sm font-semibold text-neutral-500 underline decoration-dotted underline-offset-4"
        >
          {NOPE_LABELS[nopes]}
        </motion.button>
      )}
    </div>
  );
}
