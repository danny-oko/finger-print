import type { Metadata } from "next";

import { StatusLookup } from "@/components/registration/StatusLookup";

export const metadata: Metadata = {
  title: "Бүртгэл шалгах | Finger Print",
  description: "Утасны дугаараар бүртгэлээ шалгах",
};

export default function EventStatusPage() {
  return (
    <main className="flex h-dvh flex-col overflow-hidden bg-neutral-50">
      <div className="mx-auto w-full max-w-2xl shrink-0 px-4 pt-6 pb-3 text-center">
        <h1 className="text-xl font-black text-neutral-900 sm:text-2xl">Бүртгэлээ шалгах</h1>
        <p className="mx-auto mt-1 max-w-lg text-sm text-neutral-500 sm:text-base">
          Утасны дугаараа оруулаад бүртгэл, төлбөрийн төлөв болон QR тасалбараа
          дахин харна уу.
        </p>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-2xl px-4 pb-8">
          <StatusLookup />
        </div>
      </div>
    </main>
  );
}
