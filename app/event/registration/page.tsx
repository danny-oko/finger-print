import type { Metadata } from "next";

import { EventPageTitle, EventShell } from "@/components/event/EventShell";
import { RegistrationForm } from "@/components/registration/RegistrationForm";
import { EVENT } from "@/lib/event";

const DESCRIPTION = `${EVENT.name} чуулганы онлайн бүртгэл. Өөрийгөө эсвэл бүлгээрээ бүртгүүлээрэй.`;

export const metadata: Metadata = {
  title: `Бүртгэл | ${EVENT.name}`,
  description: DESCRIPTION,
  openGraph: {
    type: "website",
    siteName: "Finger Print",
    locale: "mn_MN",
    url: "/event/registration",
    title: `${EVENT.name} — онлайн бүртгэл`,
    description: DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: `${EVENT.name} — онлайн бүртгэл`,
    description: DESCRIPTION,
  },
};

export default function EventRegistrationPage() {
  return (
    <EventShell link={{ href: "/event/status", label: "Бүртгэлээ шалгах" }} className="pb-0">
      <EventPageTitle title="Бүртгүүлэх">
        <p>
          Чуулган {EVENT.dateLong}, {EVENT.weekday} гарагт {EVENT.time} цагт болно.
          Төлбөр төлөгдмөгц хүн бүрийн QR тасалбар энэ сайтад шууд гарна.
        </p>
      </EventPageTitle>
      <RegistrationForm />
    </EventShell>
  );
}
