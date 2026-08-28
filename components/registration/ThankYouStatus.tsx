"use client";

import { CheckCircle2, Clock, Loader2, XCircle } from "lucide-react";
import * as React from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatMnt } from "@/lib/registration/pricing";

type Registration = {
  id: string;
  registrant_type: string;
  payer_name: string;
  attendee_count: number;
  total_mnt: number;
  currency: string;
  status: "pending" | "paid" | "failed" | "expired" | "cancelled";
};

const POLL_INTERVAL_MS = 2500;
const MAX_POLLS = 12;

export function ThankYouStatus({ registrationId }: { registrationId: string }) {
  const [registration, setRegistration] = React.useState<Registration | null>(null);
  const [error, setError] = React.useState(false);
  const pollsRef = React.useRef(0);

  React.useEffect(() => {
    let cancelled = false;

    async function poll() {
      try {
        const res = await fetch(`/api/registration/${registrationId}`, { cache: "no-store" });
        if (!res.ok) throw new Error();
        const data = await res.json();
        if (cancelled) return;

        setRegistration(data.registration);

        pollsRef.current += 1;
        if (data.registration.status === "pending" && pollsRef.current < MAX_POLLS) {
          setTimeout(poll, POLL_INTERVAL_MS);
        }
      } catch {
        if (!cancelled) setError(true);
      }
    }

    poll();
    return () => {
      cancelled = true;
    };
  }, [registrationId]);

  if (error) {
    return (
      <Card className="border-neutral-200">
        <CardContent className="flex flex-col items-center gap-3 py-10 text-center">
          <XCircle className="size-10 text-destructive" />
          <p className="font-bold">Мэдээлэл татахад алдаа гарлаа</p>
          <p className="text-sm text-muted-foreground">Хуудсыг дахин ачаална уу.</p>
        </CardContent>
      </Card>
    );
  }

  if (!registration) {
    return (
      <Card className="border-neutral-200">
        <CardContent className="flex flex-col items-center gap-3 py-10 text-center">
          <Loader2 className="size-10 animate-spin text-[#F98C01]" />
          <p className="font-bold">Уншиж байна...</p>
        </CardContent>
      </Card>
    );
  }

  if (registration.status === "paid") {
    return (
      <Card className="border-neutral-200">
        <CardContent className="flex flex-col items-center gap-3 py-10 text-center">
          <CheckCircle2 className="size-12 text-green-600" />
          <p className="text-xl font-black">Төлбөр амжилттай!</p>
          <p className="text-muted-foreground">
            {registration.payer_name}, таны {registration.attendee_count} хүний бүртгэл
            баталгаажлаа.
          </p>
          <p className="font-bold text-[#F98C01]">{formatMnt(registration.total_mnt)}</p>
          <Button asChild className="mt-4">
            <a href="/event/status">Бүртгэлээ шалгах</a>
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (registration.status === "pending") {
    return (
      <Card className="border-neutral-200">
        <CardContent className="flex flex-col items-center gap-3 py-10 text-center">
          <Clock className="size-10 animate-pulse text-[#F98C01]" />
          <p className="font-bold">Төлбөрийг баталгаажуулж байна...</p>
          <p className="text-sm text-muted-foreground">
            Хэдхэн секунд хүлээнэ үү. Bonum-оос төлбөр амжилттай хийсэн бол автоматаар
            шинэчлэгдэнэ.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-neutral-200">
      <CardContent className="flex flex-col items-center gap-3 py-10 text-center">
        <XCircle className="size-12 text-destructive" />
        <p className="text-xl font-black">Төлбөр амжилтгүй боллоо</p>
        <p className="text-muted-foreground">
          {registration.status === "expired"
            ? "Төлбөрийн хугацаа дууссан байна."
            : "Төлбөр хийхэд алдаа гарлаа."}{" "}
          Дахин бүртгүүлж үзнэ үү.
        </p>
        <Button asChild className="mt-4">
          <a href="/event/registration">Дахин бүртгүүлэх</a>
        </Button>
      </CardContent>
    </Card>
  );
}
