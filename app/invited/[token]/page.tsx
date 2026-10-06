import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { EventPageTitle, EventShell } from "@/components/event/EventShell";
import { InviteRegistrationForm } from "@/components/registration/InviteRegistrationForm";
import { EVENT } from "@/lib/event";
import { isValidInviteToken } from "@/lib/registration/invite";

export const metadata: Metadata = {
  title: `Урилга | ${EVENT.name}`,
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
    <EventShell width="sm">
      <EventPageTitle title="Урилгаар бүртгүүлэх">
        <p>
          Та урилгатай тул төлбөр төлөхгүй. Мэдээллээ бөглөөд QR тасалбараа шууд аваарай.
          Чуулган {EVENT.dateLong}, {EVENT.weekday} гарагт {EVENT.time} цагт болно.
        </p>
      </EventPageTitle>
      <InviteRegistrationForm token={token} />
    </EventShell>
  );
}
