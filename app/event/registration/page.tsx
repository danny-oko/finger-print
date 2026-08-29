import type { Metadata } from "next";

import { RegistrationForm } from "@/components/registration/RegistrationForm";

export const metadata: Metadata = {
  title: "Бүртгэл | Finger Print",
  description: "Finger Print конференцын онлайн бүртгэл",
};

export default function EventRegistrationPage() {
  return (
    <main className="flex h-dvh flex-col overflow-hidden bg-neutral-50">
      <div className="mx-auto w-full max-w-2xl shrink-0 px-4 pt-6 pb-3 text-center">
        <p className="text-xs font-semibold text-[#F98C01] sm:text-sm">
          2026.10.10 · FINGER PRINT
        </p>
        <h1 className="mt-1 text-xl font-black text-neutral-900 sm:text-2xl">
          Конференцэд бүртгүүлэх
        </h1>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-2xl px-4 pb-8">
          <RegistrationForm />
        </div>
      </div>
    </main>
  );
}
