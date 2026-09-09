import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { RegistrationDetail } from "@/components/registration/RegistrationDetail";
import { Button } from "@/components/ui/button";
import { logServerError, userMessage } from "@/lib/errors";
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

  // These two failures used to land on the same 404. They're opposites: a
  // missing row means this link is wrong and nothing will change by waiting,
  // while a database fault means the registration is almost certainly fine
  // and the page is the broken part. Telling someone holding a paid ticket
  // that it doesn't exist is the worst thing this page can do.
  let registration;
  try {
    registration = await getRegistrationDetail(id);
  } catch (error) {
    logServerError("registration.detailPage", error, { registrationId: id });
    const { title, hint } = userMessage("service_unavailable");

    return (
      <main className="min-h-dvh bg-neutral-50">
        <div className="mx-auto grid w-full max-w-md justify-items-center gap-3 px-4 py-16 text-center">
          <h1 className="text-xl font-black text-neutral-900">{title}</h1>
          <p className="max-w-sm text-sm text-neutral-500">{hint}</p>
          <p className="max-w-sm text-sm text-neutral-500">
            Энэ хуудсыг хэдхэн минутын дараа дахин ачаалахад бүртгэл тань хэвээр
            байх болно.
          </p>
          <Button asChild variant="outline" className="mt-1 h-11">
            <Link href="/event/status">Бүртгэлээ хайх</Link>
          </Button>
        </div>
      </main>
    );
  }

  if (!registration) notFound();

  return (
    <main className="min-h-dvh bg-neutral-50">
      <div className="mx-auto w-full max-w-md px-4 py-10">
        <RegistrationDetail initial={registration} />
      </div>
    </main>
  );
}
