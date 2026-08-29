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
    <main className="flex h-dvh flex-col overflow-hidden bg-neutral-50">
      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-10">
        <div className="mx-auto w-full max-w-md">
          {rid ? (
            <ThankYouStatus registrationId={rid} />
          ) : (
            <p className="text-center text-muted-foreground">Бүртгэлийн дугаар олдсонгүй.</p>
          )}
        </div>
      </div>
    </main>
  );
}
