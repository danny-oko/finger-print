"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Users, UserRound } from "lucide-react";
import * as React from "react";
import { FormProvider, useForm, type Path } from "react-hook-form";
import { toast } from "sonner";

import { AttendeeFields } from "@/components/registration/AttendeeFields";
import { AttendeesStep } from "@/components/registration/AttendeesStep";
import { Stepper } from "@/components/registration/Stepper";
import { SummaryStep } from "@/components/registration/SummaryStep";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { PricingSettings } from "@/lib/registration/pricing";
import {
  createRegistrationSchema,
  type CreateRegistrationInput,
  type RegistrationFormValues,
} from "@/lib/registration/schema";

const BLANK_ATTENDEE: RegistrationFormValues["attendees"][number] = {
  fullName: "",
  age: undefined,
  phone: "",
  parentPhone: "",
  churchName: "",
  grade: undefined,
};

type StepId = "type" | "payer" | "attendee" | "attendees" | "summary";

const STEP_LABELS: Record<StepId, string> = {
  type: "Төрөл",
  payer: "Холбоо барих",
  attendee: "Мэдээлэл",
  attendees: "Хамрагчид",
  summary: "Тойм",
};

function TypeStep() {
  return (
    <FormField
      name="registrantType"
      render={({ field }) => (
        <div className="grid gap-4 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => field.onChange("individual")}
            className={cn(
              "flex flex-col items-start gap-3 rounded-2xl border-2 p-6 text-left transition-colors",
              field.value === "individual"
                ? "border-[#F98C01] bg-[#FFF7EC]"
                : "border-neutral-200 hover:border-neutral-300",
            )}
          >
            <UserRound className="size-8 text-[#F98C01]" />
            <div>
              <p className="font-bold">Хувиараа бүртгүүлэх</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Өөрийгөө ганцаараа бүртгүүлж, өөрөө төлбөрөө хийнэ.
              </p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => field.onChange("church_leader")}
            className={cn(
              "flex flex-col items-start gap-3 rounded-2xl border-2 p-6 text-left transition-colors",
              field.value === "church_leader"
                ? "border-[#F98C01] bg-[#FFF7EC]"
                : "border-neutral-200 hover:border-neutral-300",
            )}
          >
            <Users className="size-8 text-[#F98C01]" />
            <div>
              <p className="font-bold">Сүмийн ахлагчаар олноор нь бүртгэх</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Сүмийнхээ хэд хэдэн хүүхдийг нэг дор бүртгэж, нэг удаа төлнө.
              </p>
            </div>
          </button>
        </div>
      )}
    />
  );
}

function PayerStep() {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <FormField
        name="payerName"
        render={({ field }) => (
          <FormItem className="sm:col-span-2">
            <FormLabel>Таны бүтэн нэр</FormLabel>
            <FormControl>
              <Input {...field} placeholder="Бат-Эрдэнэ Ганбаяр" autoComplete="name" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        name="payerPhone"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Таны утасны дугаар</FormLabel>
            <FormControl>
              <Input
                {...field}
                inputMode="tel"
                maxLength={8}
                placeholder="99112233"
                onChange={(e) => field.onChange(e.target.value.replace(/\D/g, "").slice(0, 8))}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}

export function RegistrationForm() {
  const form = useForm<RegistrationFormValues, unknown, CreateRegistrationInput>({
    resolver: zodResolver(createRegistrationSchema),
    mode: "onChange",
    defaultValues: {
      registrantType: undefined,
      payerName: "",
      payerPhone: "",
      attendees: [BLANK_ATTENDEE],
    },
  });

  const [stepIndex, setStepIndex] = React.useState(0);
  const [churches, setChurches] = React.useState<string[]>([]);
  const [pricing, setPricing] = React.useState<PricingSettings | null>(null);
  const [submitting, setSubmitting] = React.useState(false);

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

  const registrantType = form.watch("registrantType");

  const steps: StepId[] = React.useMemo(() => {
    if (registrantType === "church_leader") return ["type", "payer", "attendees", "summary"];
    return ["type", "attendee", "summary"];
  }, [registrantType]);

  const currentStep = steps[stepIndex];

  async function goNext() {
    let fieldsToValidate: Path<RegistrationFormValues>[] = [];

    if (currentStep === "type") {
      if (!registrantType) {
        form.setError("registrantType", { message: "Бүртгүүлэх төрлөө сонгоно уу" });
        return;
      }
      if (registrantType === "individual") {
        const first = form.getValues("attendees")[0] ?? BLANK_ATTENDEE;
        form.setValue("attendees", [first]);
      }
    }
    if (currentStep === "payer") fieldsToValidate = ["payerName", "payerPhone"];
    if (currentStep === "attendee") {
      fieldsToValidate = [
        "attendees.0.fullName",
        "attendees.0.age",
        "attendees.0.phone",
        "attendees.0.parentPhone",
        "attendees.0.churchName",
        "attendees.0.grade",
      ];
    }
    if (currentStep === "attendees") fieldsToValidate = ["attendees"];

    const valid = fieldsToValidate.length ? await form.trigger(fieldsToValidate) : true;
    if (!valid) return;

    // The "individual" flow has no separate payer step — the one attendee's
    // own name/phone double as the payer info the schema requires at the
    // top level, so sync them in before the summary step reads/submits them.
    if (currentStep === "attendee") {
      const attendee = form.getValues("attendees.0");
      form.setValue("payerName", attendee.fullName);
      form.setValue("payerPhone", attendee.phone ?? "");
    }

    setStepIndex((i) => Math.min(i + 1, steps.length - 1));
  }

  function goBack() {
    setStepIndex((i) => Math.max(i - 1, 0));
  }

  async function onSubmit(values: CreateRegistrationInput) {
    setSubmitting(true);

    const payload: CreateRegistrationInput =
      values.registrantType === "individual"
        ? {
            ...values,
            payerName: values.attendees[0].fullName,
            payerPhone: values.attendees[0].phone ?? "",
          }
        : values;

    try {
      const res = await fetch("/api/registration", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (!res.ok || !data.followUpLink) {
        throw new Error(data.error ?? "unknown");
      }

      window.location.href = data.followUpLink;
    } catch {
      toast.error("Бүртгэл үүсгэхэд алдаа гарлаа. Дахин оролдоно уу.");
      setSubmitting(false);
    }
  }

  const isLastStep = stepIndex === steps.length - 1;

  return (
    <FormProvider {...form}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (isLastStep) {
            form.handleSubmit(onSubmit)();
          } else {
            goNext();
          }
        }}
        className="grid gap-6"
      >
        <Stepper labels={steps.map((s) => STEP_LABELS[s])} currentIndex={stepIndex} />

        <Card className="border-neutral-200 shadow-sm">
          <CardContent className="pt-6">
            {currentStep === "type" && <TypeStep />}
            {currentStep === "payer" && <PayerStep />}
            {currentStep === "attendee" && (
              <AttendeeFields namePrefix="attendees.0" churches={churches} phoneRequired />
            )}
            {currentStep === "attendees" && <AttendeesStep churches={churches} />}
            {currentStep === "summary" && <SummaryStep pricing={pricing} />}
          </CardContent>
        </Card>

        <div className="flex items-center justify-between gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={goBack}
            disabled={stepIndex === 0 || submitting}
          >
            Буцах
          </Button>

          {isLastStep ? (
            <Button type="submit" size="lg" disabled={submitting} className="min-w-40">
              {submitting ? (
                <>
                  <Loader2 className="size-4 animate-spin" /> Түр хүлээнэ үү...
                </>
              ) : (
                "Bonum-оор төлөх"
              )}
            </Button>
          ) : (
            <Button type="submit" size="lg">
              Үргэлжлүүлэх
            </Button>
          )}
        </div>
      </form>
    </FormProvider>
  );
}
