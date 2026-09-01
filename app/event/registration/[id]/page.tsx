import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { RegistrationDetail } from "@/components/registration/RegistrationDetail";
import { getRegistrationDetail } from "@/lib/registration/detail";

export const metadata: Metadata = {
  title: "Миний бүртгэл | Finger Print",
  // The id is unguessable but the page shows attendee names, so keep it out
  // of search results.
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function RegistrationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const registration = await getRegistrationDetail(id).catch(() => null);

  if (!registration) notFound();

  return (
    <main className="min-h-dvh bg-neutral-50">
      <div className="mx-auto w-full max-w-md px-4 py-10">
        <RegistrationDetail initial={registration} />
      </div>
    </main>
  );
}
