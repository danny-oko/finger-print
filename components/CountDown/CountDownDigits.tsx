"use client";

import * as React from "react";
import CountDownTile from "./CountDownTile";

type Props = {
  value: string; // e.g. "217" or "05"
  minDigits?: number; // e.g. 2 for hours/min/sec
};

export default function CountDownDigits({ value, minDigits = 2 }: Props) {
  const v = String(value).padStart(minDigits, "0");

  return (
    <div className="flex items-center gap-3">
      {v.split("").map((d, i) => (
        <CountDownTile key={`${d}-${i}`} value={d} />
      ))}
    </div>
  );
}
