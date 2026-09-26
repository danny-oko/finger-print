import { TicketCheck } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { InviteAnswer } from "@/components/come/InviteAnswer";
import { ShareInvite } from "@/components/come/ShareInvite";
import { cleanFriendName, comePath } from "@/lib/come/friendName";

const DESCRIPTION =
  "2026.10.10, 09:00–17:00 · Хурууны хээ өсвөрийн чуулган. Хамтдаа явъя — бүртгэл нээлттэй!";

type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateMetadata({
  searchParams,
}: Props): Promise<Metadata> {
  const to = cleanFriendName((await searchParams).to);
  const title = to
    ? `${to}, надтай хамт хурууны хээд явна ингсэнүүдээ?~`
    : "Надтай хамт хурууны хээд явна ингсэнүүдээ?~";

  // The card greets the friend by name, so it's a route rather than an
  // opengraph-image file — those never see the query string.
  const image = {
    url: to
      ? `/api/og/come?to=${encodeURIComponent(to)}`
      : "/api/og/come",
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
    twitter: {
      card: "summary_large_image",
      title,
      description: DESCRIPTION,
      images: [image],
    },
  };
}

function Sticker({
  src,
  className,
  priority,
}: {
  src: string;
  className: string;
  priority?: boolean;
}) {
  return (
    <Image
      src={src}
      alt=""
      width={120}
      height={120}
      unoptimized
      priority={priority}
      className={className}
    />
  );
}

export default async function ComeWithMePage({ searchParams }: Props) {
  const to = cleanFriendName((await searchParams).to);

  return (
    <main className="relative min-h-dvh overflow-hidden bg-[#F2EDE1] text-[#14161A]">
      <div
        aria-hidden
        className="come-drift pointer-events-none absolute -top-24 -right-24 size-72 rounded-full bg-[#37A8C4]"
      />
      <div
        aria-hidden
        className="come-drift pointer-events-none absolute top-[38%] -right-12 size-28 rounded-full bg-[#E04434] [animation-delay:-3s]"
      />
      <div
        aria-hidden
        className="come-drift pointer-events-none absolute -bottom-32 -left-28 size-80 rounded-full bg-[#F7C948] [animation-delay:-6s]"
      />

      <div className="relative mx-auto flex min-h-dvh w-full max-w-md flex-col justify-center gap-4 px-4 pt-14 pb-4 short:gap-3 short:pt-10 short:pb-3">
        <section className="relative rounded-[2rem] border-2 border-[#14161A] bg-white px-5 pt-12 pb-4 text-center shadow-[6px_6px_0_#14161A] short:pt-9 short:pb-3">
          <div className="absolute inset-x-0 -top-12 flex justify-center short:-top-9">
            <Sticker
              src="/come/love-letter.gif"
              priority
              className="come-bob size-24 short:size-[72px]"
            />
          </div>
          <Sticker
            src="/come/sparkles.gif"
            className="absolute top-3 right-4 size-8 short:size-7"
          />
          <Sticker
            src="/come/popper.gif"
            className="absolute top-4 left-4 size-8 -scale-x-100 short:size-7"
          />

          <p className="inline-flex max-w-full items-center rounded-full bg-[#F2EDE1] px-4 py-1 text-sm font-bold short:text-xs">
            {to ? (
              <span className="truncate">
                Хөөе, <span className="text-[#F98C01]">{to}</span>! 👋
              </span>
            ) : (
              "Хөөе! 👋"
            )}
          </p>

          <h1 className="mt-3 text-[2.6rem] leading-[0.95] font-black tracking-tight text-balance short:mt-2 short:text-[2.15rem]">
            Надтай хамт{" "}
            <span className="inline-flex items-center gap-1 text-[#37A8C4]">
              явах уу?
              <Sticker
                src="/come/pleading.gif"
                priority
                className="size-11 short:size-9"
              />
            </span>
          </h1>

          <p className="mt-2 text-sm text-neutral-600 short:mt-1.5 short:text-[13px]">
            Чи <b className="text-[#14161A]">Хурууны хээ 2026</b>-д
            урилгатай шүүү! 🎉
          </p>

          <div className="mt-3 flex flex-wrap justify-center gap-2 text-sm font-bold short:mt-2 short:text-xs">
            <span className="rounded-full border-2 border-[#14161A] px-3 py-0.5">
              📅 10.10 · Бямба
            </span>
            <span className="rounded-full border-2 border-[#14161A] px-3 py-0.5">
              ⏰ 09:00–17:00
            </span>
          </div>

          <InviteAnswer />
        </section>

        <ShareInvite />

        <Link
          href="/event/status"
          className="mx-auto inline-flex h-9 items-center gap-1.5 rounded-full border-2 border-[#14161A] bg-white px-4 text-sm font-bold shadow-[2px_2px_0_#14161A] transition-transform active:translate-y-0.5 short:h-8 short:text-xs"
        >
          <TicketCheck className="size-4" />
          Бүртгэлээ шалгах
        </Link>
      </div>
    </main>
  );
}
