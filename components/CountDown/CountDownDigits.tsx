"use client";

import CountDownTile from "./CountDownTile";

type Props = {
  value: string;
  minDigits?: number;
};

export default function CountDownDigits({ value, minDigits = 2 }: Props) {
  const v = String(value).padStart(minDigits, "0");

  return (
    <div className="flex items-center justify-center gap-2 sm:gap-3 flex-nowrap">
      {v.split("").map((d, i) => (
        <CountDownTile key={`${d}-${i}`} value={d} />
      ))}
    </div>
  );
}
