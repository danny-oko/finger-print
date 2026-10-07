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
import { v4 as uuid } from "uuid";

import { AttendeeRow, onlyDigits } from "@/components/registration/AttendeeRow";
import { AvailabilityNotice } from "@/components/registration/AvailabilityNotice";
import { ChurchCombobox } from "@/components/registration/ChurchCombobox";
import { advanceOnFullPhone, focusNextField } from "@/components/registration/focusNextField";
import { FIELD_CLASS, FormStep, LABEL_CLASS } from "@/components/registration/FormStep";
import { ModeChoice } from "@/components/registration/ModeChoice";
import { PriceBar } from "@/components/registration/PriceBar";
import { ReviewDialog, type SubmitPhase } from "@/components/registration/ReviewDialog";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { QueueCancelled, useQueuePass } from "@/hooks/use-queue-pass";
import { useRegistrationBootstrap } from "@/hooks/use-registration-bootstrap";
import { useRegistrationDraft } from "@/hooks/use-registration-draft";
import { useTakenPhones } from "@/hooks/use-taken-phones";
import { trackEvent } from "@/lib/analytics/client";
import { errorCodeFrom, userMessage } from "@/lib/errors";
import {
  PHONE_TAKEN_MESSAGE,
  registrationFormSchema,
  toCreateRegistrationInput,
  type PaymentMethod,
  type RegistrationFormOutput,
  type RegistrationFormValues,
  type RegistrationMode,
} from "@/lib/registration/schema";

type Attendee = RegistrationFormValues["attendees"][number];

const BLANK_ATTENDEE = { fullName: "", phone: "", grade: undefined } as unknown as Attendee;

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

type FormResolver = Resolver<RegistrationFormValues, unknown, RegistrationFormOutput>;

function useTakenPhoneResolver(isTaken: React.RefObject<(phone: string) => boolean>) {
  return React.useMemo<FormResolver>(() => {
    const base = zodResolver(registrationFormSchema) as FormResolver;

    return async (values, context, options) => {
      const result = await base(values, context, options);
      const attendeeErrors = [...((result.errors.attendees as unknown[] | undefined) ?? [])];
      let flagged = false;

      (values.attendees ?? []).forEach((attendee, index) => {
        const phone = (attendee?.phone ?? "").trim();
        const existing = attendeeErrors[index] as { phone?: unknown } | undefined;
        // An empty or malformed number already has its own message; only an
        // otherwise-good one can be somebody else's.
        if (!phone || existing?.phone || !isTaken.current(phone)) return;

        attendeeErrors[index] = {
          ...(existing ?? {}),
          phone: { type: "taken", message: PHONE_TAKEN_MESSAGE },
        };
        flagged = true;
      });

      if (!flagged) return result;

      return {
        values: {},
        errors: { ...result.errors, attendees: attendeeErrors } as FieldErrors<RegistrationFormValues>,
      } as Awaited<ReturnType<FormResolver>>;
    };
  }, [isTaken]);
}

export function RegistrationForm() {
  const isTakenRef = React.useRef<(phone: string) => boolean>(() => false);
  const resolver = useTakenPhoneResolver(isTakenRef);

  const form = useForm<RegistrationFormValues, unknown, RegistrationFormOutput>({
    resolver,
    mode: "onTouched",
    defaultValues: {
      mode: "self",
      churchName: "",
      payerName: "",
      payerPhone: "",
      attendees: [BLANK_ATTENDEE],
    },
  });

  const { fields, append, remove, replace } = useFieldArray({
    control: form.control,
    name: "attendees",
  });

  useRegistrationDraft(form);

  const { data: bootstrap, reload: reloadBootstrap, addChurch } = useRegistrationBootstrap();
  const queue = useQueuePass();

  const mode = useWatch({ control: form.control, name: "mode" }) ?? "self";
  const isGroup = mode === "group";

  // ─── duplicate-phone check as people type ────────────────────────────────
  const watchedAttendees = useWatch({ control: form.control, name: "attendees" });
  const phones = React.useMemo(
    () => (watchedAttendees ?? []).map((a) => (a?.phone ?? "").trim()),
    [watchedAttendees],
  );
  const isTaken = useTakenPhones(phones);
  React.useEffect(() => {
    isTakenRef.current = isTaken;
  }, [isTaken]);

  const flaggedRef = React.useRef<`attendees.${number}.phone`[]>([]);

  // A verdict arrives well after the keystroke that asked for it, so the
  // fields it concerns are re-run — plus the ones flagged last time, so a
  // corrected number loses its red without waiting for a blur.
  React.useEffect(() => {
    const taken = phones
      .map((phone, index) => ({ phone, index }))
      .filter(({ phone }) => phone && isTaken(phone))
      .map(({ index }) => `attendees.${index}.phone` as const);

    const paths = [...new Set([...flaggedRef.current, ...taken])];
    flaggedRef.current = taken;
    if (paths.length > 0) void form.trigger(paths);
  }, [isTaken, phones, form]);

  // ─── analytics ───────────────────────────────────────────────────────────
  const startedRef = React.useRef(false);
  React.useEffect(() => {
    const subscription = form.watch(() => {
      if (startedRef.current) return;
      startedRef.current = true;
      trackEvent("registration_started", {});
    });
    return () => subscription.unsubscribe();
  }, [form]);

  // ─── mode and people ─────────────────────────────────────────────────────
  const [focusIndex, setFocusIndex] = React.useState<number | null>(null);

  function changeMode(next: RegistrationMode) {
    if (next === mode) return;
    form.setValue("mode", next, { shouldDirty: true });
    // The rules differ by mode (a lone registrant's phone is required, an
    // attendee's in a group isn't), so old messages would point at the wrong rule.
    form.clearErrors();

    // Going back to "just me" keeps the first person and sets the others
    // aside — undoable, since a mis-tap shouldn't cost ten typed names.
    if (next === "self" && fields.length > 1) {
      const everyone = form.getValues("attendees");
      replace([everyone[0]]);
      toast(`${everyone.length - 1} хүнийг жагсаалтаас хаслаа`, {
        action: {
          label: "Буцаах",
          onClick: () => {
            form.setValue("mode", "group");
            replace(everyone);
          },
        },
      });
    }
  }

  function addAttendee() {
    append(BLANK_ATTENDEE);
    setFocusIndex(fields.length);
    trackEvent("registration_person_added", { attendees: fields.length + 1 });
  }

  // ─── review and submit ───────────────────────────────────────────────────
  const [review, setReview] = React.useState<RegistrationFormOutput | null>(null);
  const [saving, setSaving] = React.useState(false);
  // One per submission attempt: a retry of the same review reuses it, so
  // the server answers with the registration it already made.
  const idempotencyKey = React.useRef<string | null>(null);

  const phase: SubmitPhase = queue.view.phase === "waiting" ? "queue" : saving || queue.view.phase === "joining" ? "saving" : "idle";

  function openReview(values: RegistrationFormOutput) {
    trackEvent("registration_review_opened", { attendees: values.attendees.length });
    idempotencyKey.current = uuid();
    setReview(values);
  }

  function closeReview() {
    queue.cancel();
    setReview(null);
  }

  async function post(
    values: RegistrationFormOutput,
    method: PaymentMethod,
    pass: string | null,
  ): Promise<Response> {
    return fetch("/api/registration", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(pass ? { "X-Queue-Pass": pass } : {}),
      },
      body: JSON.stringify(
        toCreateRegistrationInput(values, method, idempotencyKey.current ?? undefined),
      ),
    });
  }

  async function confirmAndPay(method: PaymentMethod) {
    if (!review) return;
    const values = review;

    trackEvent("registration_submitted", {
      attendees: values.attendees.length,
      registrantType: values.mode === "group" ? "church_leader" : "individual",
      paymentMethod: method,
    });

    let res: Response;
    try {
      let pass = await queue.acquire();
      setSaving(true);
      res = await post(values, method, pass);

      // The pass ran out while they waited on the dialog — one fresh turn.
      if (res.status === 428) {
        queue.forget();
        setSaving(false);
        pass = await queue.acquire();
        setSaving(true);
        res = await post(values, method, pass);
      }
    } catch (error) {
      setSaving(false);
      if (error instanceof QueueCancelled) return;
      // Nothing reached the server, so retrying is safe — and the
      // idempotency key makes it safe even if something did.
      const { title, hint } = userMessage("network_error");
      toast.error(title, { description: hint });
      return;
    }

    if (res.ok) {
      const data = (await res.json().catch(() => null)) as { paymentUrl?: string } | null;
      if (data?.paymentUrl) {
        // The draft survives the handoff on purpose: an abandoned payment
        // brings people back here. The ticket page clears it once paid. A
        // transfer lands on the registration page, which says it's being checked.
        window.location.href = data.paymentUrl;
        return;
      }
    }

    setSaving(false);
    const code = res.ok ? "payment_error" : await errorCodeFrom(res.clone());
    const body = (await res.json().catch(() => ({}))) as {
      phones?: string[];
      registrationId?: string;
    };
    const { title, hint } = userMessage(code);

    switch (code) {
      case "phone_taken": {
        // Somebody registered one of these numbers between opening the
        // review and confirming it. Back to the form with those rows marked.
        const taken = new Set(body.phones ?? []);
        values.attendees.forEach((attendee, index) => {
          if (attendee.phone && taken.has(attendee.phone)) {
            form.setError(`attendees.${index}.phone`, { type: "taken", message: PHONE_TAKEN_MESSAGE });
          }
        });
        setReview(null);
        toast.error(title, { description: hint });
        return;
      }
      case "sold_out":
      case "registration_closed":
      case "registration_paused":
        setReview(null);
        void reloadBootstrap();
        toast.error(title, { description: hint, duration: 10000 });
        return;
      case "transfer_pending":
        // This person already sent a transfer that staff haven't checked.
        // A second registration would ask them to pay twice.
        setReview(null);
        toast(title, {
          description: hint,
          duration: 12000,
          action: body.registrationId
            ? {
                label: "Бүртгэлээ харах",
                onClick: () => {
                  window.location.href = `/event/registration/${body.registrationId}`;
                },
              }
            : undefined,
        });
        return;
      case "payment_error":
        // The registration did save. Pointing at it is better than "try
        // again", which would make a second one.
        toast.error(title, {
          description: hint,
          duration: 12000,
          action: body.registrationId
            ? {
                label: "Бүртгэлээ харах",
                onClick: () => {
                  window.location.href = `/event/registration/${body.registrationId}`;
                },
              }
            : undefined,
        });
        return;
      default:
        toast.error(title, { description: hint });
    }
  }

  function onInvalid(errors: FieldErrors<RegistrationFormValues>) {
    trackEvent("registration_invalid", {
      field: firstErrorField(errors) ?? "unknown",
      attendees: fields.length,
    });
    toast.error("Бөглөөгүй эсвэл буруу талбар байна", {
      description: "Улаанаар тэмдэглэсэн хэсгийг шалгана уу.",
    });
    requestAnimationFrame(() =>
      document
        .querySelector("[aria-invalid='true']")
        ?.scrollIntoView({ behavior: "smooth", block: "center" }),
    );
  }

  const availability = bootstrap?.availability;
  const blocked = availability !== undefined && availability.status !== "open";

  return (
    <FormProvider {...form}>
      {availability && <AvailabilityNotice availability={availability} />}

      <form
        onSubmit={form.handleSubmit(openReview, onInvalid)}
        noValidate
        className="grid gap-4 [&_[data-slot=form-message]]:text-[13px]"
      >
        <FormStep step={1} title="Хэнийг бүртгүүлэх вэ?">
          <ModeChoice value={mode} onChange={changeMode} />
        </FormStep>

        <FormStep
          step={2}
          title="Аль цуглаанаас ирэх вэ?"
          hint="Жагсаалтаас олдохгүй бол нэрийг нь бичээд нэмнэ үү."
        >
          <FormField
            control={form.control}
            name="churchName"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="sr-only">Цуглаан</FormLabel>
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
        </FormStep>

        {isGroup ? (
          <>
            <FormStep
              step={3}
              title="Бүртгэл үүсгэж буй хүний мэдээлэл"
              hint="Бүх тасалбарыг дараа нь энэ утасны дугаараар хайж олно."
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="payerName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className={LABEL_CLASS}>Таны нэр</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          className={FIELD_CLASS}
                          placeholder="Овог, нэр"
                          autoComplete="name"
                          enterKeyHint="next"
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              focusNextField(e.currentTarget);
                            }
                          }}
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
                      <FormLabel className={LABEL_CLASS}>Таны утас</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          value={(field.value as string | undefined) ?? ""}
                          className={FIELD_CLASS}
                          type="tel"
                          inputMode="numeric"
                          autoComplete="tel-national"
                          maxLength={8}
                          placeholder="8 оронтой дугаар"
                          onChange={(e) => {
                            const digits = onlyDigits(e.target.value);
                            advanceOnFullPhone(field.value as string | undefined, digits, e.currentTarget);
                            field.onChange(digits);
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </FormStep>

            <FormStep
              step={4}
              title="Оролцох хүмүүс"
              hint="Та өөрөө оролцох бол өөрийгөө ч энд нэмнэ үү. Утасны дугаар заавал биш."
            >
              <div className="grid gap-3">
                {fields.map((field, index) => (
                  <AttendeeRow
                    key={field.id}
                    index={index}
                    self={false}
                    autoFocus={focusIndex === index}
                    onRemove={fields.length > 1 ? () => remove(index) : undefined}
                  />
                ))}
              </div>

              <button
                type="button"
                onClick={addAttendee}
                disabled={fields.length >= 50}
                className="mt-3 flex h-12 w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-black/15 text-[15px] font-semibold text-ink/80 transition-colors hover:border-ink/40 hover:bg-mist focus-visible:outline-2 focus-visible:outline-ink disabled:opacity-50"
              >
                <Plus className="size-5" />
                Хүн нэмэх
              </button>
            </FormStep>
          </>
        ) : (
          <FormStep
            step={3}
            title="Таны мэдээлэл"
            hint="Тасалбараа дараа нь энэ утасны дугаараар хайж олно."
          >
            {fields[0] && <AttendeeRow key={fields[0].id} index={0} self />}
          </FormStep>
        )}

        <PriceBar
          pricing={bootstrap?.pricing ?? null}
          attendeeCount={fields.length}
          disabled={blocked || phase !== "idle"}
        />
      </form>

      <ReviewDialog
        values={review}
        pricing={bootstrap?.pricing ?? null}
        phase={phase}
        queue={queue.view}
        onEdit={closeReview}
        onConfirm={confirmAndPay}
        onLeaveQueue={closeReview}
      />
    </FormProvider>
  );
}
