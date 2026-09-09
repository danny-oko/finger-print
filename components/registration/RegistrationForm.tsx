"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Plus } from "lucide-react";
import * as React from "react";
import {
  FormProvider,
  useFieldArray,
  useForm,
  useWatch,
  type FieldErrors,
  type Resolver,
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
import { useTakenPhones } from "@/hooks/use-taken-phones";
import { trackEvent } from "@/lib/analytics/client";
import { errorCodeFrom, userMessage } from "@/lib/errors";
import type { PricingSettings } from "@/lib/registration/pricing";
import {
  registrationFormSchema,
  toCreateRegistrationInput,
  PHONE_TAKEN_MESSAGE,
  type PaymentMethod,
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

type FormResolver = Resolver<
  RegistrationFormValues,
  unknown,
  RegistrationFormOutput
>;

export function RegistrationForm() {
  // Whether a number is already attending is an answer only the server has,
  // so it arrives after the schema has had its say. Layering it into the
  // resolver rather than calling setError keeps it a real validation result:
  // it shows under the field and it blocks submit, like every other rule.
  const isTakenRef = React.useRef<(phone: string) => boolean>(() => false);

  const resolver = React.useMemo<FormResolver>(() => {
    const base = zodResolver(registrationFormSchema) as FormResolver;

    return async (values, context, options) => {
      const result = await base(values, context, options);

      const attendeeErrors = [
        ...((result.errors.attendees as unknown[] | undefined) ?? []),
      ];
      let flagged = false;

      (values.attendees ?? []).forEach((attendee, index) => {
        const phone = (attendee?.phone ?? "").trim();
        const existing = attendeeErrors[index] as
          | { phone?: unknown }
          | undefined;

        // An empty or malformed number already has its own message; only an
        // otherwise-good one can be somebody else's.
        if (!phone || existing?.phone || !isTakenRef.current(phone)) return;

        attendeeErrors[index] = {
          ...(existing ?? {}),
          phone: { type: "taken", message: PHONE_TAKEN_MESSAGE },
        };
        flagged = true;
      });

      if (!flagged) return result;

      return {
        values: {},
        errors: {
          ...result.errors,
          attendees: attendeeErrors,
        } as FieldErrors<RegistrationFormValues>,
      } as Awaited<ReturnType<FormResolver>>;
    };
  }, []);

  const form = useForm<RegistrationFormValues, unknown, RegistrationFormOutput>(
    {
      resolver,
      mode: "onTouched",
      defaultValues: {
        churchName: "",
        payerName: "",
        payerPhone: "",
        attendees: [BLANK_ATTENDEE],
      },
    },
  );

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "attendees",
  });

  useRegistrationDraft(form);

  const watchedAttendees = useWatch({ control: form.control, name: "attendees" });
  const phones = React.useMemo(
    () => (watchedAttendees ?? []).map((a) => (a?.phone ?? "").trim()),
    [watchedAttendees],
  );

  const isTaken = useTakenPhones(phones);
  isTakenRef.current = isTaken;

  const flaggedRef = React.useRef<`attendees.${number}.phone`[]>([]);

  // A verdict arrives well after the keystroke that asked for it, so the
  // fields it concerns have to be re-run. Only those: revalidating the whole
  // form would light up rows the person hasn't reached yet. The fields
  // flagged last time are re-run too — otherwise a field the person marked
  // and then corrected keeps its red until it's blurred, since react-hook-form
  // only revalidates a field it considers touched.
  React.useEffect(() => {
    const taken = phones
      .map((phone, index) => ({ phone, index }))
      .filter(({ phone }) => phone && isTaken(phone))
      .map(({ index }) => `attendees.${index}.phone` as const);

    const paths = [...new Set([...flaggedRef.current, ...taken])];
    flaggedRef.current = taken;

    if (paths.length > 0) form.trigger(paths);
  }, [isTaken, phones, form]);

  const [churches, setChurches] = React.useState<string[]>([]);
  const [pricing, setPricing] = React.useState<PricingSettings | null>(null);
  // Which payment button is mid-flight, so only that one shows a spinner.
  const [submitting, setSubmitting] = React.useState<PaymentMethod | null>(null);
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

  async function confirmAndPay(method: PaymentMethod) {
    if (!review) return;
    setSubmitting(method);

    const payload = toCreateRegistrationInput(review, method);
    trackEvent("registration_submitted", {
      attendees: payload.attendees.length,
      registrantType: payload.registrantType,
      paymentMethod: method,
    });

    let res: Response;
    try {
      res = await fetch("/api/registration", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    } catch {
      // The request never left — nothing was saved, so retrying is safe and
      // saying so stops people submitting again from a different tab.
      const { title, hint } = userMessage("network_error");
      toast.error(title, { description: hint });
      setSubmitting(null);
      return;
    }

    if (!res.ok) {
      const code = await errorCodeFrom(res.clone());
      const { title, hint } = userMessage(code);

      // Somebody registered one of these numbers between opening the review
      // and confirming it. Back to the form with the offending rows marked —
      // the resolver keeps them marked, since the check now has its answer.
      if (code === "phone_taken") {
        const { phones: takenPhones } = (await res.json().catch(() => ({}))) as {
          phones?: string[];
        };

        const taken = new Set(takenPhones ?? []);
        review.attendees.forEach((attendee, index) => {
          if (attendee.phone && taken.has(attendee.phone)) {
            form.setError(`attendees.${index}.phone`, {
              type: "taken",
              message: PHONE_TAKEN_MESSAGE,
            });
          }
        });

        toast.error(title, { description: hint });
        setReview(null);
        setSubmitting(null);
        return;
      }

      // A payment failure is the one case where the registration did save.
      // Repeating "try again" here would earn a duplicate row, so it points
      // at the saved one instead.
      if (code === "payment_error") {
        const { registrationId } = (await res.json().catch(() => ({}))) as {
          registrationId?: string;
        };

        toast.error(title, {
          description: hint,
          duration: 10000,
          action: registrationId
            ? {
                label: "Бүртгэлээ харах",
                onClick: () => {
                  window.location.href = `/event/registration/${registrationId}`;
                },
              }
            : undefined,
        });
      } else {
        toast.error(title, { description: hint });
      }

      setSubmitting(null);
      return;
    }

    const data = await res.json().catch(() => null);

    if (!data?.paymentUrl) {
      const { title, hint } = userMessage("payment_error");
      toast.error(title, { description: hint });
      setSubmitting(null);
      return;
    }

    // The draft deliberately survives the handoff: an invoice can go unpaid
    // for a day, and coming back to a form that still holds everyone's names
    // is the difference between paying late and giving up. The detail page
    // clears it once the payment lands.
    window.location.href = data.paymentUrl;
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
        className="grid gap-4 [&_[data-slot=form-label]]:text-[13px] [&_[data-slot=form-message]]:text-xs [&_[data-slot=form-message]]:leading-snug [&_[role=combobox]]:h-11 [&_input]:h-11"
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

          {isGroup && (
            <Section
              title="Бүртгэж буй хүн"
              hint="Тасалбар энэ хуудсанд гарна — дараа нь энэ дугаараар хайж олно."
            >
              <div className="grid gap-4 sm:grid-cols-2">
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
              </div>
            </Section>
          )}
        </div>

        <PriceBar
          pricing={pricing}
          attendeeCount={fields.length}
          submitting={submitting !== null}
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
