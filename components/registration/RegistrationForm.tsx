"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Plus } from "lucide-react";
import * as React from "react";
import { FormProvider, useFieldArray, useForm } from "react-hook-form";
import { toast } from "sonner";

import { AttendeeRow } from "@/components/registration/AttendeeRow";
import { ChurchCombobox } from "@/components/registration/ChurchCombobox";
import { PriceBar } from "@/components/registration/PriceBar";
import { Button } from "@/components/ui/button";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useRegistrationDraft } from "@/hooks/use-registration-draft";
import type { PricingSettings } from "@/lib/registration/pricing";
import {
  registrationFormSchema,
  toCreateRegistrationInput,
  type RegistrationFormOutput,
  type RegistrationFormValues,
} from "@/lib/registration/schema";

const BLANK_ATTENDEE: RegistrationFormValues["attendees"][number] = {
  fullName: "",
  phone: "",
  parentPhone: "",
  grade: undefined,
};

function Section({
  title,
  hint,
  children,
}: {
  title: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="grid gap-3">
      <div>
        <h2 className="text-sm font-bold text-neutral-900">{title}</h2>
        {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
      </div>
      {children}
    </section>
  );
}

export function RegistrationForm() {
  const form = useForm<RegistrationFormValues, unknown, RegistrationFormOutput>({
    resolver: zodResolver(registrationFormSchema),
    mode: "onTouched",
    defaultValues: {
      churchName: "",
      payerName: "",
      payerPhone: "",
      payerEmail: "",
      attendees: [BLANK_ATTENDEE],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "attendees",
  });

  const { clearDraft } = useRegistrationDraft(form);

  const [churches, setChurches] = React.useState<string[]>([]);
  const [pricing, setPricing] = React.useState<PricingSettings | null>(null);
  const [submitting, setSubmitting] = React.useState(false);
  const [focusIndex, setFocusIndex] = React.useState<number | null>(null);

  React.useEffect(() => {
    fetch("/api/registration/churches")
      .then((r) => r.json())
      .then((d) => setChurches(d.churches ?? []))
      .catch(() => {});
    fetch("/api/registration/pricing")
      .then((r) => r.json())
      .then(setPricing)
      .catch(() => {});
  }, []);

  const handleCreateChurch = React.useCallback((name: string) => {
    setChurches((prev) =>
      prev.some((c) => c.toLowerCase() === name.toLowerCase())
        ? prev
        : [...prev, name].sort((a, b) => a.localeCompare(b, "mn")),
    );

    fetch("/api/registration/churches", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    }).catch(() => {});
  }, []);

  // Nobody picks "individual" or "church leader" any more — the shape of the
  // form says it. One person is registering themselves; two or more means
  // somebody is registering on their behalf and has to say who they are.
  const isGroup = fields.length > 1;

  function addAttendee() {
    append(BLANK_ATTENDEE);
    setFocusIndex(fields.length);
  }

  async function onSubmit(values: RegistrationFormOutput) {
    setSubmitting(true);

    try {
      const res = await fetch("/api/registration", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(toCreateRegistrationInput(values)),
      });
      const data = await res.json();

      if (!res.ok || !data.checkoutUrl) {
        throw new Error(data.error ?? "unknown");
      }

      clearDraft();
      window.location.href = data.checkoutUrl;
    } catch {
      toast.error("Бүртгэл үүсгэхэд алдаа гарлаа. Дахин оролдоно уу.");
      setSubmitting(false);
    }
  }

  function onInvalid() {
    // Every field the schema can fail on is on screen, so this just points
    // people at the first one rather than explaining anything.
    toast.error("Дутуу бөглөсөн талбар байна.");
    document
      .querySelector("[aria-invalid='true']")
      ?.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  return (
    <FormProvider {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit, onInvalid)}
        className="grid gap-6"
      >
        <Section
          title="Хамаарах сүм"
          hint="Энэ бүртгэлээр бүртгүүлж буй бүх хүн нэг сүмээс."
        >
          <FormField
            control={form.control}
            name="churchName"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <ChurchCombobox
                    value={field.value}
                    churches={churches}
                    onChange={(v) =>
                      form.setValue("churchName", v, { shouldValidate: true })
                    }
                    onCreate={handleCreateChurch}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </Section>

        <Section
          title="Бүртгүүлэх хүн"
          hint="Олон хүнийг нэг дор бүртгэж, нэг удаа төлж болно."
        >
          <div className="grid gap-3">
            {fields.map((field, index) => (
              <AttendeeRow
                key={field.id}
                index={index}
                phoneRequired={!isGroup}
                autoFocus={focusIndex === index}
                onRemove={
                  fields.length > 1 ? () => remove(index) : undefined
                }
              />
            ))}
          </div>

          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={addAttendee}
          >
            <Plus className="size-4" />
            Хүн нэмэх
          </Button>
        </Section>

        <Section
          title="Тасалбар хүлээн авах"
          hint="Бүх хамрагчийн QR тасалбарыг энэ имэйлээр илгээнэ."
        >
          <div className="grid gap-3 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="payerEmail"
              render={({ field }) => (
                <FormItem className="sm:col-span-2">
                  <FormLabel>Имэйл хаяг</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="email"
                      placeholder="name@example.com"
                      autoComplete="email"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {isGroup && (
              <>
                <FormField
                  control={form.control}
                  name="payerName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Бүртгэж буй хүний нэр</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Бат-Эрдэнэ Ганбаяр"
                          autoComplete="name"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="payerPhone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Таны утас</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          inputMode="tel"
                          maxLength={8}
                          placeholder="99112233"
                          onChange={(e) =>
                            field.onChange(
                              e.target.value.replace(/\D/g, "").slice(0, 8),
                            )
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}
          </div>
        </Section>

        <PriceBar
          pricing={pricing}
          attendeeCount={fields.length}
          submitting={submitting}
        />
      </form>
    </FormProvider>
  );
}
