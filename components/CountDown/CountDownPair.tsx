"use client";

import * as React from "react";
import CountDownTile from "./CountDownTile";

type Props = { value: string };

export default function CountDownPair({ value }: Props) {
  const v = String(value).padStart(2, "0").slice(-2);

  return (
    <div className="min-w-0 shrink flex items-center gap-2 sm:gap-3">
      <CountDownTile value={v[0]} />
      <CountDownTile value={v[1]} />
    </div>
  );
}
