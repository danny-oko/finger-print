"use client";

import { Check, Copy, ExternalLink, Landmark, Link2, Loader2, Plus } from "lucide-react";
import * as React from "react";
import { FormProvider } from "react-hook-form";
import { toast } from "sonner";
import { v4 as uuid } from "uuid";

import { AdminHeader } from "@/components/admin/AdminHeader";
import { PriceBar } from "@/components/registration/PriceBar";
import {
  EMPTY_REGISTRATION,
  RegistrationFields,
  showInvalidFields,
  useRegistrationForm,
} from "@/components/registration/RegistrationFields";
import {
  PRIMARY_CLASS,
  ReviewList,
  ReviewTotal,
  SECONDARY_CLASS,
  TERTIARY_CLASS,
} from "@/components/registration/ReviewDialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useRegistrationBootstrap } from "@/hooks/use-registration-bootstrap";
import { createRegistration } from "@/lib/admin/actions";
import type { StaffPayment, StaffRegistrationResponse } from "@/lib/admin/types";
import { computePricing } from "@/lib/registration/pricing";
import {
  PHONE_TAKEN_MESSAGE,
  toCreateRegistrationInput,
  type RegistrationFormOutput,
} from "@/lib/registration/schema";

const DONE_TITLE: Record<StaffPayment, string> = {
  paid: "Бүртгэгдлээ, тасалбар гарлаа",
  checkout: "Бүртгэгдлээ, төлбөр хүлээгдэж байна",
  transfer: "Бүртгэгдлээ, шилжүүлэг хүлээгдэж байна",
};

const DONE_HINT: Record<StaffPayment, string> = {
  paid: "Энэ холбоосоор хүн бүрийн QR тасалбар харагдана. Бүртгүүлэгчид илгээнэ үү.",
  checkout:
    "Энэ холбоосоор онлайн төлбөрөө төлнө. Төлбөр ормогц тасалбар нь мөн энэ хуудсанд гарна.",
  transfer:
    "Мөнгө орсны дараа бүртгэлийн хяналтаас «Төлсөн» болгоход тасалбар гарна. Тасалбар энэ холбоосоор харагдана.",
};

type Done = StaffRegistrationResponse & { payment: StaffPayment; attendees: number };

function DoneCard({ done, onNext }: { done: Done; onNext: () => void }) {
  const [copied, setCopied] = React.useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(done.registrationUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Хуулж чадсангүй. Холбоосыг гараар сонгоно уу.");
    }
  }

  return (
    <section className="rounded-3xl border border-black/[0.06] bg-white p-6">
      <div className="flex size-11 items-center justify-center rounded-full bg-emerald-50">
        <Check className="size-5 text-emerald-600" />
      </div>
      <h2 className="mt-4 text-xl font-bold text-ink">{DONE_TITLE[done.payment]}</h2>
      <p className="mt-1 text-[15px] text-ink/60">
        {done.attendees} хүн. {DONE_HINT[done.payment]}
      </p>

      <div className="mt-5 flex gap-2">
        <input
          readOnly
          value={done.registrationUrl}
          onFocus={(e) => e.currentTarget.select()}
          aria-label="Бүртгэлийн холбоос"
          className="h-12 min-w-0 flex-1 rounded-xl border border-black/10 bg-mist px-3 text-sm text-ink"
        />
        <button type="button" onClick={copy} className={`${SECONDARY_CLASS} shrink-0 px-4`}>
          {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
          {copied ? "Хуулсан" : "Хуулах"}
        </button>
      </div>

      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        <a href={done.registrationUrl} target="_blank" rel="noreferrer" className={SECONDARY_CLASS}>
          <ExternalLink className="size-4" />
          Бүртгэл нээх
        </a>
        {done.paymentUrl && (
          <a href={done.paymentUrl} target="_blank" rel="noreferrer" className={SECONDARY_CLASS}>
            <ExternalLink className="size-4" />
            Төлбөрийн хуудас нээх
          </a>
        )}
      </div>

      <button type="button" onClick={onNext} className={`${PRIMARY_CLASS} mt-5 w-full`}>
        <Plus className="size-5" />
        Дараагийн бүртгэл
      </button>
    </section>
  );
}

function StaffReviewDialog({
  values,
  breakdown,
  saving,
  onConfirm,
  onEdit,
}: {
  values: RegistrationFormOutput | null;
  breakdown: ReturnType<typeof computePricing> | null;
  saving: StaffPayment | null;
  onConfirm: (payment: StaffPayment) => void;
  onEdit: () => void;
}) {
  const busy = saving !== null;
  const spinner = <Loader2 className="size-5 animate-spin" />;

  return (
    <Dialog
      open={values !== null}
      onOpenChange={(open) => {
        if (!open && !busy) onEdit();
      }}
    >
      <DialogContent
        showCloseButton={!busy}
        className="event-ui max-h-[92dvh] gap-0 overflow-hidden rounded-2xl p-0 sm:max-w-lg"
      >
        {values && (
          <div className="flex max-h-[92dvh] flex-col">
            <DialogHeader className="px-6 pt-6 pb-4 text-left">
              <DialogTitle className="text-xl font-bold text-ink">Мэдээллийг шалгана уу</DialogTitle>
              <DialogDescription className="text-[15px] text-ink/60">
                Төлбөрийг хэрхэн авахыг сонгоно уу.
              </DialogDescription>
            </DialogHeader>

            <ReviewList values={values} breakdown={breakdown} />

            <div className="px-6 pt-4 pb-6">
              <ReviewTotal breakdown={breakdown} />

              <div className="mt-5 grid gap-2">
                <button
                  type="button"
                  onClick={() => onConfirm("paid")}
                  disabled={busy}
                  className={PRIMARY_CLASS}
                >
                  {saving === "paid" ? spinner : <Check className="size-5" />}
                  Төлбөр авсан, тасалбар гаргах
                </button>
                <button
                  type="button"
                  onClick={() => onConfirm("checkout")}
                  disabled={busy}
                  className={SECONDARY_CLASS}
                >
                  {saving === "checkout" ? spinner : <Link2 className="size-4.5" />}
                  Онлайн төлбөрийн холбоос үүсгэх
                </button>
                <button
                  type="button"
                  onClick={() => onConfirm("transfer")}
                  disabled={busy}
                  className={SECONDARY_CLASS}
                >
                  {saving === "transfer" ? spinner : <Landmark className="size-4.5" />}
                  Дансаар шилжүүлнэ
                </button>
                <button type="button" onClick={onEdit} disabled={busy} className={TERTIARY_CLASS}>
                  Буцаж засах
                </button>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

const STATE_NOTE: Record<string, string> = {
  closed: "Нийтийн бүртгэл хаалттай байна. Эндээс бүртгэх боломжтой хэвээр.",
  paused: "Нийтийн бүртгэл түр зогссон байна. Эндээс бүртгэх боломжтой хэвээр.",
  sold_out: "Суудал дүүрсэн байна. Суудлын тоог бүртгэлийн тохиргооноос нэмнэ үү.",
};

export function StaffRegistration({ unprotected = false }: { unprotected?: boolean }) {
  const registration = useRegistrationForm();
  const { form, fields } = registration;
  const { data: bootstrap, addChurch } = useRegistrationBootstrap();

  const [review, setReview] = React.useState<{ values: RegistrationFormOutput; key: string } | null>(
    null,
  );
  const [saving, setSaving] = React.useState<StaffPayment | null>(null);
  const [done, setDone] = React.useState<Done | null>(null);

  const pricing = bootstrap?.pricing ?? null;
  const breakdown = pricing && review ? computePricing(pricing, review.values.attendees.length) : null;

  // The key is the same role as on the public form: a retried confirm
  // returns the registration that was already made instead of a second one.
  function openReview(values: RegistrationFormOutput) {
    setReview({ values, key: uuid() });
  }

  async function confirm(payment: StaffPayment) {
    if (!review) return;
    const { values, key } = review;

    setSaving(payment);
    const result = await createRegistration(
      toCreateRegistrationInput(values, payment === "paid" ? undefined : payment, key),
      payment,
    );
    setSaving(null);

    if (result.ok) {
      setReview(null);
      setDone({ ...result.data, payment, attendees: values.attendees.length });
      form.reset(EMPTY_REGISTRATION);
      window.scrollTo({ top: 0 });
      return;
    }

    if (result.code === "phone_taken") {
      const taken = new Set(result.phones ?? []);
      values.attendees.forEach((attendee, index) => {
        if (attendee.phone && taken.has(attendee.phone)) {
          form.setError(`attendees.${index}.phone`, { type: "taken", message: PHONE_TAKEN_MESSAGE });
        }
      });
      setReview(null);
    }

    toast.error(result.message);
  }

  const note = bootstrap ? STATE_NOTE[bootstrap.availability.status] : undefined;

  return (
    <div className="event-ui min-h-dvh bg-mist">
      <AdminHeader title="Шинэ бүртгэл" back="/admin" unprotected={unprotected} />

      <main className="mx-auto w-full max-w-2xl px-4 pt-6 pb-16">
        {done ? (
          <DoneCard done={done} onNext={() => setDone(null)} />
        ) : (
          <FormProvider {...form}>
            {note && (
              <p className="mb-4 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-3 text-sm text-amber-900">
                {note}
              </p>
            )}

            <form
              onSubmit={form.handleSubmit(openReview, showInvalidFields)}
              noValidate
              className="grid gap-4 [&_[data-slot=form-message]]:text-[13px]"
            >
              <RegistrationFields
                state={registration}
                churches={bootstrap?.churches ?? []}
                onCreateChurch={addChurch}
              />

              <PriceBar
                pricing={pricing}
                attendeeCount={fields.length}
                disabled={saving !== null}
                label="Шалгах"
              />
            </form>

            <StaffReviewDialog
              values={review?.values ?? null}
              breakdown={breakdown}
              saving={saving}
              onConfirm={confirm}
              onEdit={() => setReview(null)}
            />
          </FormProvider>
        )}
      </main>
    </div>
  );
}
