"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Plus } from "lucide-react";
import * as React from "react";
import {
  FormProvider,
  useFieldArray,
  useForm,
  type FieldErrors,
} from "react-hook-form";
import { toast } from "sonner";

import { AttendeeRow } from "@/components/registration/AttendeeRow";
import { ChurchCombobox } from "@/components/registration/ChurchCombobox";
import { PriceBar } from "@/components/registration/PriceBar";
import { ReviewDialog } from "@/components/registration/ReviewDialog";
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
import { trackEvent } from "@/lib/analytics/client";
import type { PricingSettings } from "@/lib/registration/pricing";
import {
  registrationFormSchema,
  toCreateRegistrationInput,
  type RegistrationFormOutput,
  type RegistrationFormValues,
} from "@/lib/registration/schema";

const BLANK_ATTENDEE = {
  fullName: "",
  phone: "",
  grade: undefined,
} as unknown as RegistrationFormValues["attendees"][number];

function firstErrorField(errors: unknown, path: string[] = []): string | null {
  if (!errors || typeof errors !== "object") return null;

  const node = errors as Record<string, unknown>;
  if ("type" in node && typeof node.message === "string") return path.join(".");

  for (const [key, value] of Object.entries(node)) {
    if (key === "ref") continue;
    const found = firstErrorField(value, [...path, key]);
    if (found) return found;
  }

  return null;
}

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
    <section className="grid gap-4 px-5 py-6 sm:px-6">
      <div className="grid gap-1">
        <h2 className="text-base font-bold tracking-tight text-neutral-900">
          {title}
        </h2>
        {hint && (
          <p className="text-[13px] leading-snug text-neutral-500">{hint}</p>
        )}
      </div>
      {children}
    </section>
  );
}

export function RegistrationForm() {
  const form = useForm<RegistrationFormValues, unknown, RegistrationFormOutput>(
    {
      resolver: zodResolver(registrationFormSchema),
      mode: "onTouched",
      defaultValues: {
        churchName: "",
        payerName: "",
        payerPhone: "",
        payerEmail: "",
        attendees: [BLANK_ATTENDEE],
      },
    },
  );

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "attendees",
  });

  const { clearDraft } = useRegistrationDraft(form);

  const [churches, setChurches] = React.useState<string[]>([]);
  const [pricing, setPricing] = React.useState<PricingSettings | null>(null);
  const [submitting, setSubmitting] = React.useState(false);
  const [focusIndex, setFocusIndex] = React.useState<number | null>(null);
  // Set only once the form validates, so the review can never show values
  // the schema would reject.
  const [review, setReview] = React.useState<RegistrationFormOutput | null>(
    null,
  );

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

  const isGroup = fields.length > 1;

  const startedRef = React.useRef(false);
  React.useEffect(() => {
    const subscription = form.watch(() => {
      if (startedRef.current) return;
      startedRef.current = true;
      trackEvent("registration_started", {});
    });
    return () => subscription.unsubscribe();
  }, [form]);

  function addAttendee() {
    append(BLANK_ATTENDEE);
    setFocusIndex(fields.length);
    trackEvent("registration_person_added", { attendees: fields.length + 1 });
  }

  function openReview(values: RegistrationFormOutput) {
    trackEvent("registration_review_opened", {
      attendees: values.attendees.length,
    });
    setReview(values);
  }

  async function confirmAndPay() {
    if (!review) return;
    setSubmitting(true);

    const payload = toCreateRegistrationInput(review);
    trackEvent("registration_submitted", {
      attendees: payload.attendees.length,
      registrantType: payload.registrantType,
    });

    try {
      const res = await fetch("/api/registration", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
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

  function onInvalid(errors: FieldErrors<RegistrationFormValues>) {
    trackEvent("registration_invalid", {
      field: firstErrorField(errors) ?? "unknown",
      attendees: fields.length,
    });

    toast.error("Дутуу бөглөсөн талбар байна.");
    document
      .querySelector("[aria-invalid='true']")
      ?.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  return (
    <FormProvider {...form}>
      <form
        onSubmit={form.handleSubmit(openReview, onInvalid)}
        // 44px controls are the smallest comfortable touch target, and this
        // form is filled on a phone far more often than not. Both the select
        // and the church combobox render as role="combobox", so one rule
        // covers every control in the form. Labels shrink to sit clearly
        // below the group titles — size only, so an invalid field's label
        // still turns red.
        className="grid gap-4 [&_[data-slot=form-label]]:text-[13px] [&_[role=combobox]]:h-11 [&_input]:h-11"
      >
        <div className="divide-y divide-neutral-200 overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm">
          <Section
            title="Хамрагддаг цуглаан"
            // hint="Нэг цуглааны ахлагч болон найзуудтайгаа хамт бүртгүүлээрэй"
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
            <div className="grid gap-7">
              {fields.map((field, index) => (
                <AttendeeRow
                  key={field.id}
                  index={index}
                  showIndex={isGroup}
                  phoneRequired={!isGroup}
                  autoFocus={focusIndex === index}
                  onRemove={fields.length > 1 ? () => remove(index) : undefined}
                />
              ))}
            </div>

            <Button
              type="button"
              variant="outline"
              className="h-11 w-full border-dashed"
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
            <div className="grid gap-4 sm:grid-cols-2">
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
        </div>

        <PriceBar
          pricing={pricing}
          attendeeCount={fields.length}
          submitting={submitting}
        />
      </form>

      <ReviewDialog
        values={review}
        pricing={pricing}
        submitting={submitting}
        onEdit={() => setReview(null)}
        onConfirm={confirmAndPay}
      />
    </FormProvider>
  );
}
