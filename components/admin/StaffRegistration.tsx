"use client";

import { Check, Copy, ExternalLink, Loader2 } from "lucide-react";
import * as React from "react";
import { FormProvider } from "react-hook-form";
import { toast } from "sonner";
import { v4 as uuid } from "uuid";

import { AdminHeader } from "@/components/admin/AdminHeader";
import { AttendeeRow } from "@/components/registration/AttendeeRow";
import { ChurchCombobox } from "@/components/registration/ChurchCombobox";
import { FIELD_CLASS, LABEL_CLASS } from "@/components/registration/FormStep";
import {
  EMPTY_REGISTRATION,
  showInvalidFields,
  useRegistrationForm,
} from "@/components/registration/RegistrationFields";
import { PRIMARY_CLASS } from "@/components/registration/ReviewDialog";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useRegistrationBootstrap } from "@/hooks/use-registration-bootstrap";
import { createRegistration } from "@/lib/admin/actions";
import type { StaffPayment, StaffRegistrationResponse } from "@/lib/admin/types";
import { computePricing, formatMnt } from "@/lib/registration/pricing";
import {
  PHONE_TAKEN_MESSAGE,
  toCreateRegistrationInput,
  type RegistrationFormOutput,
} from "@/lib/registration/schema";
import { cn } from "@/lib/utils";

const PAYMENT_LABEL: Record<StaffPayment, string> = {
  paid: "Төлсөн",
  checkout: "Онлайн холбоос",
  transfer: "Дансаар",
};

const DONE_HINT: Record<StaffPayment, string> = {
  paid: "Тасалбар гарч, ирсэн гэж бүртгэгдлээ. Холбоосыг нь илгээнэ үү.",
  checkout: "Энэ холбоосоор онлайнаар төлнө.",
  transfer: "Тасалбар гарч, ирсэн гэж бүртгэгдлээ. Холбоосыг нь илгээнэ үү.",
};

const STATE_NOTE: Record<string, string> = {
  closed: "Нийтийн бүртгэл хаалттай. Эндээс бүртгэх боломжтой.",
  paused: "Нийтийн бүртгэл түр зогссон. Эндээс бүртгэх боломжтой.",
  sold_out: "Суудал дүүрсэн. Тохиргооноос суудлын тоог нэмнэ үү.",
};

type Done = StaffRegistrationResponse & { name: string; payment: StaffPayment };

function DoneStrip({ done }: { done: Done }) {
  const [copied, setCopied] = React.useState(false);
  const url = done.paymentUrl ?? done.registrationUrl;

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Хуулж чадсангүй.");
    }
  }

  return (
    <div className="mb-4 flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 py-3 pr-3 pl-4">
      <Check className="size-5 shrink-0 text-emerald-600" />
      <div className="min-w-0 flex-1">
        <p className="truncate font-semibold text-ink">{done.name} бүртгэгдлээ</p>
        <p className="text-sm text-ink/60">{DONE_HINT[done.payment]}</p>
      </div>
      <button
        type="button"
        onClick={copy}
        aria-label="Холбоос хуулах"
        className="rounded-full p-2.5 text-ink/70 hover:bg-white"
      >
        {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
      </button>
      <a
        href={url}
        target="_blank"
        rel="noreferrer"
        aria-label="Холбоос нээх"
        className="rounded-full p-2.5 text-ink/70 hover:bg-white"
      >
        <ExternalLink className="size-4" />
      </a>
    </div>
  );
}

export function StaffRegistration({ unprotected = false }: { unprotected?: boolean }) {
  const registration = useRegistrationForm();
  const { form, fields } = registration;
  const { data: bootstrap, addChurch } = useRegistrationBootstrap();

  const [payment, setPayment] = React.useState<StaffPayment>("paid");
  const [saving, setSaving] = React.useState(false);
  const [done, setDone] = React.useState<Done | null>(null);

  const price = bootstrap?.pricing ? computePricing(bootstrap.pricing, 1).totalMnt : null;
  const note = bootstrap ? STATE_NOTE[bootstrap.availability.status] : undefined;

  async function submit(values: RegistrationFormOutput) {
    setSaving(true);
    const result = await createRegistration(
      toCreateRegistrationInput(values, payment === "checkout" ? payment : undefined, uuid()),
      payment,
    );
    setSaving(false);

    if (result.ok) {
      setDone({ ...result.data, name: values.attendees[0].fullName, payment });
      // Walk-ins tend to arrive with their church, so it stays for the next one.
      form.reset({ ...EMPTY_REGISTRATION, churchName: values.churchName });
      return;
    }

    if (result.code === "phone_taken") {
      form.setError("attendees.0.phone", { type: "taken", message: PHONE_TAKEN_MESSAGE });
    }
    toast.error(result.message);
  }

  return (
    <div className="event-ui min-h-dvh bg-mist">
      <AdminHeader title="Шинэ бүртгэл" back="/admin" unprotected={unprotected} />

      <main className="mx-auto w-full max-w-lg px-4 pt-6 pb-16">
        {note && (
          <p className="mb-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            {note}
          </p>
        )}

        {done && <DoneStrip key={done.registrationId} done={done} />}

        <FormProvider {...form}>
          <form
            onSubmit={form.handleSubmit(submit, showInvalidFields)}
            noValidate
            className="grid gap-5 rounded-3xl border border-black/[0.06] bg-white p-5 sm:p-6 [&_[data-slot=form-message]]:text-[13px]"
          >
            {fields[0] && <AttendeeRow key={fields[0].id} index={0} self nameLabel="Нэр" />}

            <FormField
              control={form.control}
              name="churchName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className={LABEL_CLASS}>Цуглаан</FormLabel>
                  <FormControl>
                    <ChurchCombobox
                      value={field.value}
                      churches={bootstrap?.churches ?? []}
                      onChange={(v) => form.setValue("churchName", v, { shouldValidate: true })}
                      onCreate={addChurch}
                      className={FIELD_CLASS}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid gap-2">
              <span className={LABEL_CLASS}>Төлбөр</span>
              <div role="radiogroup" className="grid grid-cols-3 gap-1 rounded-xl bg-mist p-1">
                {(Object.keys(PAYMENT_LABEL) as StaffPayment[]).map((option) => (
                  <button
                    key={option}
                    type="button"
                    role="radio"
                    aria-checked={payment === option}
                    onClick={() => setPayment(option)}
                    className={cn(
                      "h-10 rounded-lg text-sm font-semibold transition-colors",
                      payment === option ? "bg-white text-ink shadow-sm" : "text-ink/55 hover:text-ink",
                    )}
                  >
                    {PAYMENT_LABEL[option]}
                  </button>
                ))}
              </div>
            </div>

            <button type="submit" disabled={saving} className={PRIMARY_CLASS}>
              {saving && <Loader2 className="size-5 animate-spin" />}
              Бүртгэх{price !== null && ` · ${formatMnt(price)}`}
            </button>
          </form>
        </FormProvider>
      </main>
    </div>
  );
}
