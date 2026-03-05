// app/components/attend/AttendHeader.tsx
"use client";

import * as React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function AttendHeader({ contactHref }: { contactHref: string }) {
  return (
    <div className="md:sticky md:top-28 md:z-10">
      <p className="text-xs font-semibold tracking-widest text-muted-foreground">
        JOIN US
      </p>

      <h2 className="mt-3 text-3xl font-black tracking-tight text-foreground sm:text-4xl">
        Хуруу хээ өсвөрийн конферренсэд нэгдэх вэ?
      </h2>

      <p className="mt-4 max-w-sm text-base text-muted-foreground">
        Та хурууны хээ өсвөрийн конферренсэд дараах байдлаар хамтран оролцох
        боломжтой.
      </p>

      <div className="mt-6 flex gap-3">
        <Button className="rounded-full" asChild>
          <Link href={contactHref}>Холбогдох</Link>
        </Button>
        <Button variant="secondary" className="rounded-full" asChild>
          <Link href={contactHref}>Асууя</Link>
        </Button>
      </div>
    </div>
  );
}
