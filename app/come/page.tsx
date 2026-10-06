import { TicketCheck } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { Fingerprint } from "@/components/come/Fingerprint";
import { RegisterLink } from "@/components/come/RegisterLink";
import { ShareInvite } from "@/components/come/ShareInvite";
import { cleanFriendName, comePath } from "@/lib/come/friendName";
import { EVENT } from "@/lib/event";
import { formatMnt } from "@/lib/registration/pricing";
import { DEFAULT_SETTINGS, getRegistrationSettings } from "@/lib/registration/settings";

const DESCRIPTION = `${EVENT.dateLong}, ${EVENT.time}. ${EVENT.audience}-д зориулсан чуулган. Бүртгэл нээлттэй.`;

type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const to = cleanFriendName((await searchParams).to);
  const title = to
    ? `${to}, надтай хамт хурууны хээд явна ингсэнүүдээ?~`
    : "Надтай хамт хурууны хээд явна ингсэнүүдээ?~";

  // The card greets the friend by name, so it's a route rather than an
  // opengraph-image file — those never see the query string.
  const image = {
    url: to ? `/api/og/come?to=${encodeURIComponent(to)}` : "/api/og/come",
    width: 1200,
    height: 630,
    alt: title,
  };

  return {
    title,
    description: DESCRIPTION,
    openGraph: {
      type: "website",
      siteName: "Finger Print",
      locale: "mn_MN",
      url: comePath(to),
      title,
      description: DESCRIPTION,
      images: [image],
    },
    twitter: { card: "summary_large_image", title, description: DESCRIPTION, images: [image] },
  };
}

async function price(): Promise<number> {
  try {
    return (await getRegistrationSettings()).pricing.pricePerAttendeeMnt;
  } catch {
    return DEFAULT_SETTINGS.pricing.pricePerAttendeeMnt;
  }
}

function Fact({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <dt className="text-[13px] text-ink/55">{label}</dt>
      <dd className="mt-0.5 text-[15px] leading-snug font-medium text-ink">{children}</dd>
    </div>
  );
}

// One screen, no scrolling: it's opened from a chat on a phone, and
// everything worth knowing should be visible before the thumb moves.
export default async function ComePage({ searchParams }: Props) {
  const to = cleanFriendName((await searchParams).to);
  const pricePerAttendee = await price();

  return (
    <div className="event-ui flex h-dvh flex-col overflow-y-auto bg-mist">
      <header className="mx-auto flex h-12 w-full max-w-md shrink-0 items-center px-4">
        <Link href="/" className="rounded-md focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand">
          <Image src="/logo6.png" alt="Finger Print" width={537} height={113} priority className="h-5 w-auto" />
        </Link>
      </header>

      <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center gap-3 px-4 pb-4 short:gap-2 short:pb-3">
        <article className="overflow-hidden rounded-3xl bg-white shadow-[0_1px_2px_rgba(21,23,28,0.06)]">
          <div className="relative overflow-hidden bg-brand px-6 pt-5 pb-5 short:pt-4 short:pb-4">
            <Fingerprint className="pointer-events-none absolute -top-8 -right-14 h-56 text-ink/15" />

            <p className="relative max-w-[15rem] text-base leading-snug font-medium text-ink">
              {to ? (
                <>
                  <span className="font-semibold">{to}</span>, чамайг урьж байна
                </>
              ) : (
                "Чамайг урьж байна"
              )}
            </p>
            <h1 className="relative mt-2 font-display text-[2.3rem] leading-[1.02] font-extrabold tracking-tight text-ink short:text-[1.9rem]">
              Хурууны
              <br />
              хээ 2026
            </h1>
            <p className="relative mt-2 text-sm text-ink/75">Өсвөр үеийнхний чуулган</p>
          </div>

          <div className="px-6 pt-4 pb-5 short:pt-3 short:pb-4">
            <dl className="grid grid-cols-[1fr_auto] gap-x-6 gap-y-3 short:gap-y-2">
              <Fact label="Хэзээ">
                {EVENT.dateShort}, {EVENT.weekday}
              </Fact>
              <Fact label="Цаг">{EVENT.time}</Fact>
              <Fact label="Хэнд">{EVENT.audience}</Fact>
              <Fact label="Хураамж">{formatMnt(pricePerAttendee)}</Fact>
            </dl>

            <RegisterLink className="mt-4 short:mt-3" />
          </div>
        </article>

        <ShareInvite />

        <Link
          href="/event/status"
          className="flex h-12 shrink-0 items-center justify-center gap-2 rounded-full border border-black/15 bg-white text-[15px] font-semibold text-ink shadow-[0_1px_2px_rgba(21,23,28,0.06)] transition-colors hover:border-ink/40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink short:h-11"
        >
          <TicketCheck className="size-5" />
          Бүртгүүлсэн үү? Тасалбараа шалгах
        </Link>
      </main>
    </div>
  );
}
