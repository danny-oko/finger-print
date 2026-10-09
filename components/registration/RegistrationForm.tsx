"use client";

import * as React from "react";
import { FormProvider, type FieldErrors } from "react-hook-form";
import { toast } from "sonner";
import { v4 as uuid } from "uuid";

import { AvailabilityNotice } from "@/components/registration/AvailabilityNotice";
import { PriceBar } from "@/components/registration/PriceBar";
import {
  RegistrationFields,
  showInvalidFields,
  useRegistrationForm,
} from "@/components/registration/RegistrationFields";
import { ReviewDialog, type SubmitPhase } from "@/components/registration/ReviewDialog";
import { QueueCancelled, useQueuePass } from "@/hooks/use-queue-pass";
import { useRegistrationBootstrap } from "@/hooks/use-registration-bootstrap";
import { useRegistrationDraft } from "@/hooks/use-registration-draft";
import { trackEvent } from "@/lib/analytics/client";
import { errorCodeFrom, userMessage } from "@/lib/errors";
import {
  PHONE_TAKEN_MESSAGE,
  toCreateRegistrationInput,
  type PaymentMethod,
  type RegistrationFormOutput,
  type RegistrationFormValues,
} from "@/lib/registration/schema";

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

export function RegistrationForm() {
  const registration = useRegistrationForm({
    onAttendeeAdded: (attendees) => trackEvent("registration_person_added", { attendees }),
  });
  const { form, fields } = registration;

  useRegistrationDraft(form);

  const { data: bootstrap, reload: reloadBootstrap, addChurch } = useRegistrationBootstrap();
  const queue = useQueuePass();

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
    showInvalidFields();
  }

  const availability = bootstrap?.availability;
  const blocked = availability !== undefined && availability.status !== "open";

  return (
    <FormProvider {...form}>
      {availability && <AvailabilityNotice availability={availability} />}

      <form
        onSubmit={(event) => form.handleSubmit(openReview, onInvalid)(event)}
        noValidate
        className="grid gap-4 [&_[data-slot=form-message]]:text-[13px]"
      >
        <RegistrationFields
          state={registration}
          churches={bootstrap?.churches ?? []}
          onCreateChurch={addChurch}
        />

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
