import type { Metadata } from "next";

import { RegistrationForm } from "@/components/registration/RegistrationForm";

export const metadata: Metadata = {
  title: "Бүртгэл | Finger Print",
  description: "Finger Print хурлын онлайн бүртгэл",
};

export default function EventRegistrationPage() {
  return (
    <main className="min-h-screen bg-neutral-50">
      <div className="bg-neutral-900 px-4 pt-28 pb-16 text-white sm:pt-32">
        <div className="mx-auto w-full max-w-2xl">
          <span className="inline-block rounded-full border border-[#F98C01]/40 bg-[#F98C01]/10 px-3 py-1 text-xs font-semibold tracking-wide text-[#F98C01]">
            2026.10.03 · FINGER PRINT
          </span>
          <h1 className="mt-4 text-3xl font-black sm:text-4xl">Хуралд бүртгүүлэх</h1>
          <p className="mt-3 text-neutral-400">
            Хувиараа бүртгүүлэх эсвэл сүмийнхээ хүүхдүүдийг олноор нь бүртгэж, Bonum-оор
            төлбөрөө хийнэ үү.
          </p>
        </div>
      </div>

      <div className="mx-auto w-full max-w-2xl px-4 py-10 sm:py-12">
        <RegistrationForm />

        <p className="mt-10 text-center text-sm text-muted-foreground">
          Асуулт байвал бидэнтэй холбогдоно уу:{" "}
          <a href="mailto:firstchurch@gmail.com" className="font-medium text-[#F98C01]">
            firstchurch@gmail.com
          </a>
        </p>
      </div>
    </main>
  );
}
