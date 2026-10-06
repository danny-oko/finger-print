import type { Metadata } from "next";

import { EventPageTitle, EventShell } from "@/components/event/EventShell";
import { StatusLookup } from "@/components/registration/StatusLookup";
import { EVENT } from "@/lib/event";

export const metadata: Metadata = {
  title: `Бүртгэлээ шалгах | ${EVENT.name}`,
  description: "Утасны дугаараараа бүртгэл, төлбөр, QR тасалбараа шалгах",
};

export default function EventStatusPage() {
  return (
    <EventShell link={{ href: "/event/registration", label: "Бүртгүүлэх" }} width="sm">
      <EventPageTitle title="Бүртгэлээ шалгах">
        <p>Бүртгүүлэхдээ оруулсан утасны дугаараа бичээд төлбөрийн төлөв болон QR тасалбараа харна уу.</p>
      </EventPageTitle>
      <StatusLookup />
    </EventShell>
  );
}
