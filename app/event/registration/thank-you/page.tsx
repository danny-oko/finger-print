import type { Metadata } from "next";

import { ThankYouStatus } from "@/components/registration/ThankYouStatus";

export const metadata: Metadata = {
  title: "Баярлалаа | Finger Print",
};

export default async function ThankYouPage({
  searchParams,
}: {
  searchParams: Promise<{ rid?: string }>;
}) {
  const { rid } = await searchParams;

  return (
    <main className="min-h-screen bg-neutral-50 px-4 py-20">
      <div className="mx-auto w-full max-w-md">
        {rid ? (
          <ThankYouStatus registrationId={rid} />
        ) : (
          <p className="text-center text-muted-foreground">Бүртгэлийн дугаар олдсонгүй.</p>
        )}
      </div>
    </main>
  );
}
