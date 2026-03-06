"use client";

import * as React from "react";
import CountDownDigits from "./CountDownDigits";

type Props = {
  label: string;
  value: string;
  minDigits?: number;
  className?: string;
};

export default function CountDownUnit({
  label,
  value,
  minDigits = 2,
  className,
}: Props) {
  return (
    <div className={["flex flex-col items-center gap-4", className].join(" ")}>
      <CountDownDigits value={value} minDigits={minDigits} />
      <div className="text-sm font-semibold text-white/90">{label}</div>
    </div>
  );
}
