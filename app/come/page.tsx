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
    <div className="grid grid-cols-[5.5rem_1fr] gap-3 py-3 first:pt-0 last:pb-0">
      <dt className="text-[15px] text-ink/55">{label}</dt>
      <dd className="text-[15px] leading-snug font-medium text-ink">{children}</dd>
    </div>
  );
}

export default async function ComePage({ searchParams }: Props) {
  const to = cleanFriendName((await searchParams).to);
  const pricePerAttendee = await price();

  return (
    <div className="event-ui min-h-dvh bg-mist">
      <header className="mx-auto flex h-14 max-w-md items-center px-4">
        <Link href="/" className="rounded-md focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand">
          <Image src="/logo6.png" alt="Finger Print" width={537} height={113} priority className="h-6 w-auto" />
        </Link>
      </header>

      <main className="mx-auto grid w-full max-w-md gap-4 px-4 pt-2 pb-12">
        <article className="overflow-hidden rounded-3xl bg-white shadow-[0_1px_2px_rgba(21,23,28,0.06)]">
          <div className="relative overflow-hidden bg-brand px-6 pt-7 pb-8">
            <Fingerprint className="pointer-events-none absolute -top-6 -right-14 h-64 text-ink/15" />

            <p className="relative max-w-[15rem] text-[17px] leading-snug font-medium text-ink">
              {to ? (
                <>
                  <span className="font-semibold">{to}</span>, чамайг урьж байна
                </>
              ) : (
                "Чамайг урьж байна"
              )}
            </p>
            <h1 className="relative mt-3 font-display text-[2.6rem] leading-[1.02] font-extrabold tracking-tight text-ink">
              Хурууны
              <br />
              хээ 2026
            </h1>
            <p className="relative mt-3 text-[15px] text-ink/75">Өсвөр үеийнхний чуулган</p>
          </div>

          <div className="px-6 pt-6 pb-6">
            <dl className="divide-y divide-black/5">
              <Fact label="Хэзээ">
                {EVENT.dateLong}, {EVENT.weekday}
              </Fact>
              <Fact label="Цаг">{EVENT.time}</Fact>
              <Fact label="Хэнд">{EVENT.audience}</Fact>
              <Fact label="Хураамж">{formatMnt(pricePerAttendee)}</Fact>
            </dl>

            <RegisterLink className="mt-6" />
            <Link
              href="/"
              className="mt-2 flex h-11 items-center justify-center rounded-full text-[15px] font-semibold text-ink/70 hover:bg-mist focus-visible:outline-2 focus-visible:outline-ink"
            >
              Чуулганы тухай дэлгэрэнгүй
            </Link>
          </div>
        </article>

        <ShareInvite />

        <Link
          href="/event/status"
          className="mx-auto mt-2 inline-flex items-center gap-2 rounded-full px-4 py-2 text-[15px] font-medium text-ink/70 hover:bg-white hover:text-ink focus-visible:outline-2 focus-visible:outline-ink"
        >
          <TicketCheck className="size-4" />
          Бүртгүүлсэн үү? Тасалбараа шалгах
        </Link>
      </main>
    </div>
  );
}
