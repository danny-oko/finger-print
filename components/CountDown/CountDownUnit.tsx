"use client";

import * as React from "react";
import CountDownDigits from "./CountDownDigits";

type Props = {
  label: string;
  value: string;
  minDigits?: number;
};

export default function CountDownUnit({ label, value, minDigits = 2 }: Props) {
  return (
    <div className="flex w-full flex-col items-center gap-4">
      <CountDownDigits value={value} minDigits={minDigits} />
      <div className="text-sm font-semibold text-white/90">{label}</div>
    </div>
  );
}
