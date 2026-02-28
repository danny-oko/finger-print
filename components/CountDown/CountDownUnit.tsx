"use client";

import * as React from "react";
import CountDownDigits from "./CountDownDigits";

type Props = {
  label: string;
  value: string; // "217" or "05"
  minDigits?: number; // Days=3, others=2
};

export default function CountDownUnit({ label, value, minDigits = 2 }: Props) {
  return (
    <div className="flex flex-col items-center gap-4">
      <CountDownDigits value={value} minDigits={minDigits} />
      <div className="text-sm font-semibold text-white/90">{label}</div>
    </div>
  );
}
