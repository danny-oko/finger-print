"use client";

import * as React from "react";
import CountDownTile from "./CountDownTile";

type Props = {
  value: string; // "00".."99"
};

export default function CountDownPair({ value }: Props) {
  const v = String(value).padStart(2, "0").slice(-2);

  return (
    <div className="flex items-center gap-3">
      <CountDownTile value={v[0]} />
      <CountDownTile value={v[1]} />
    </div>
  );
}
