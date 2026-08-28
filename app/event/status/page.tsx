import type { Metadata } from "next";

import { StatusLookup } from "@/components/registration/StatusLookup";

export const metadata: Metadata = {
  title: "Бүртгэл шалгах | Finger Print",
  description: "Утасны дугаараар бүртгэлээ шалгах",
};

export default function EventStatusPage() {
  return (
    <main className="min-h-screen bg-neutral-50">
      <div className="bg-neutral-900 px-4 pt-28 pb-16 text-white sm:pt-32">
        <div className="mx-auto w-full max-w-2xl">
          <h1 className="text-3xl font-black sm:text-4xl">Бүртгэлээ шалгах</h1>
          <p className="mt-3 text-neutral-400">
            Бүртгүүлэхдээ ашигласан утасны дугаараа оруулж, бүртгэл болон төлбөрийн
            төлөвөө шалгана уу.
          </p>
        </div>
      </div>

      <div className="mx-auto w-full max-w-2xl px-4 py-10 sm:py-12">
        <StatusLookup />
      </div>
    </main>
  );
}
