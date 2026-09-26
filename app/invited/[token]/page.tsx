import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { InviteRegistrationForm } from "@/components/registration/InviteRegistrationForm";
import { isValidInviteToken } from "@/lib/registration/invite";

export const metadata: Metadata = {
  title: "Урилга | Хурууны хээ 2026",
  robots: { index: false, follow: false },
  // The token is the whole secret; don't hand it to whatever page is next.
  referrer: "no-referrer",
};

export const dynamic = "force-dynamic";

export default async function InvitedRegistrationPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  if (!isValidInviteToken(token)) notFound();

  return (
    <main className="min-h-dvh bg-neutral-50">
      <div className="mx-auto w-full max-w-md px-4 pt-8 pb-10">
        <div className="pb-5 text-center">
          <p className="text-xs font-semibold text-[#F98C01] sm:text-sm">
            2026.10.10 · Хурууны хээ
          </p>
          <h1 className="mt-1 text-2xl font-black text-neutral-900">
            Урилгаар бүртгүүлэх
          </h1>
          <p className="mt-2 text-[13px] text-balance text-neutral-500">
            Та урилгатай тул төлбөр төлөх шаардлагагүй. Мэдээллээ бөглөөд
            тасалбараа шууд аваарай.
          </p>
        </div>

        <InviteRegistrationForm token={token} />
      </div>
    </main>
  );
}
