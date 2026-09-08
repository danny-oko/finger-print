import type { Metadata } from "next";
import Link from "next/link";

import { RegistrationForm } from "@/components/registration/RegistrationForm";

export const metadata: Metadata = {
  title: "Бүртгэл | Хурууны хээ 2026",
  description: "Finger Print конференцын онлайн бүртгэл",
};

export default function EventRegistrationPage() {
  return (
    <main className="flex h-dvh flex-col overflow-hidden bg-neutral-50">
      <div className="mx-auto w-full max-w-2xl shrink-0 px-4 pt-6 pb-3 text-center">
        <p className="text-xs font-semibold text-[#F98C01] sm:text-sm">
          2026.10.10 · Хурууны хээ · 43
        </p>
        <h1 className="mt-1 text-xl font-black text-neutral-900 sm:text-2xl">
          Конференцэд бүртгүүлэх
        </h1>
        <p className="mt-2 text-[13px] text-neutral-500">
          Аль хэдийн бүртгүүлсэн үү?{" "}
          <Link
            href="/event/status"
            className="font-semibold text-[#F98C01] underline underline-offset-2"
          >
            Бүртгэлээ шалгах
          </Link>
        </p>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-2xl px-4 pb-8">
          <RegistrationForm />
        </div>
      </div>
    </main>
  );
}
