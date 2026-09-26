"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import * as React from "react";
import { useForm, useWatch, type FieldErrors, type Resolver } from "react-hook-form";
import { toast } from "sonner";

import { ChurchCombobox } from "@/components/registration/ChurchCombobox";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTakenPhones } from "@/hooks/use-taken-phones";
import { errorCodeFrom, userMessage } from "@/lib/errors";
import { GRADE_CHOICES, gradeChoiceLabel } from "@/lib/registration/grade";
import {
  invitedRegistrationFormSchema,
  PHONE_TAKEN_MESSAGE,
  type InvitedRegistrationFormOutput,
  type InvitedRegistrationFormValues,
} from "@/lib/registration/schema";
import { TICKET_GRADIENT, TICKET_GRAIN } from "@/lib/ticket/texture";

type FormResolver = Resolver<
  InvitedRegistrationFormValues,
  unknown,
  InvitedRegistrationFormOutput
>;

export function InviteRegistrationForm({ token }: { token: string }) {
  const router = useRouter();

  // Same layering as the public form: the taken-phone verdict is folded into
  // the resolver so it blocks submit and survives revalidation.
  const isTakenRef = React.useRef<(phone: string) => boolean>(() => false);
  const rejectedRef = React.useRef(new Set<string>());

  const resolver = React.useMemo<FormResolver>(() => {
    const base = zodResolver(invitedRegistrationFormSchema) as FormResolver;

    return async (values, context, options) => {
      const result = await base(values, context, options);
      const phone = (values.phone ?? "").trim();

      if (
        !phone ||
        result.errors.phone ||
        !(isTakenRef.current(phone) || rejectedRef.current.has(phone))
      ) {
        return result;
      }

      return {
        values: {},
        errors: {
          ...result.errors,
          phone: { type: "taken", message: PHONE_TAKEN_MESSAGE },
        } as FieldErrors<InvitedRegistrationFormValues>,
      } as Awaited<ReturnType<FormResolver>>;
    };
  }, []);

  const form = useForm<
    InvitedRegistrationFormValues,
    unknown,
    InvitedRegistrationFormOutput
  >({
    resolver,
    mode: "onTouched",
    defaultValues: {
      churchName: "",
      fullName: "",
      phone: "",
      grade: undefined as unknown as InvitedRegistrationFormValues["grade"],
    },
  });

  const phone = (useWatch({ control: form.control, name: "phone" }) ?? "").trim();
  const phones = React.useMemo(() => [phone], [phone]);
  const isTaken = useTakenPhones(phones);

  React.useEffect(() => {
    isTakenRef.current = isTaken;
  }, [isTaken]);

  const flaggedRef = React.useRef(false);

  // The verdict lands after the keystroke that asked for it, so the field
  // is re-run — also once after it stops being taken, to clear the red.
  React.useEffect(() => {
    const taken = Boolean(phone) && isTaken(phone);
    if (taken || flaggedRef.current) form.trigger("phone");
    flaggedRef.current = taken;
  }, [isTaken, phone, form]);

  const [churches, setChurches] = React.useState<string[]>([]);
  const [submitting, setSubmitting] = React.useState(false);

  const phoneRef = React.useRef<HTMLInputElement>(null);
  const gradeRef = React.useRef<HTMLButtonElement>(null);

  React.useEffect(() => {
    fetch("/api/registration/churches")
      .then((r) => r.json())
      .then((d) => setChurches(d.churches ?? []))
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

  async function onSubmit(values: InvitedRegistrationFormOutput) {
    setSubmitting(true);

    let res: Response;
    try {
      res = await fetch("/api/registration/invited", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...values, token }),
      });
    } catch {
      const { title, hint } = userMessage("network_error");
      toast.error(title, { description: hint });
      setSubmitting(false);
      return;
    }

    if (!res.ok) {
      const code = await errorCodeFrom(res);

      if (code === "phone_taken") {
        rejectedRef.current.add(values.phone);
        form.setError("phone", { type: "taken", message: PHONE_TAKEN_MESSAGE });
        phoneRef.current?.focus();
      }

      // The page only renders for a live token, so a 404 here means it was
      // rotated while the form was open — "registration not found" would
      // point them at the wrong problem.
      if (code === "not_found") {
        toast.error("Урилгын холбоос хүчингүй болсон байна", {
          description: "Зохион байгуулагчаас шинэ холбоос авна уу.",
        });
      } else {
        const { title, hint } = userMessage(code);
        toast.error(title, { description: hint });
      }

      setSubmitting(false);
      return;
    }

    const data = (await res.json().catch(() => null)) as {
      registrationId?: string;
    } | null;

    if (!data?.registrationId) {
      const { title, hint } = userMessage("unknown");
      toast.error(title, { description: hint });
      setSubmitting(false);
      return;
    }

    // Left disabled on purpose: the navigation is still in flight.
    router.push(`/event/registration/${data.registrationId}`);
  }

  function onInvalid() {
    toast.error("Дутуу бөглөсөн талбар байна.");
    document
      .querySelector("[aria-invalid='true']")
      ?.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  const phoneTaken = form.formState.errors.phone?.type === "taken";

  return (
    <Form {...form}>
      <form
        onSubmit={(e) => form.handleSubmit(onSubmit, onInvalid)(e)}
        noValidate
        className="grid gap-4 [&_[data-slot=form-label]]:text-[13px] [&_[data-slot=form-message]]:text-xs [&_[data-slot=form-message]]:leading-snug [&_[role=combobox]]:h-11 [&_input]:h-11"
      >
        <div className="relative overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm">
          <div
            aria-hidden
            className="relative h-1.5 overflow-hidden"
            style={{ backgroundImage: TICKET_GRADIENT }}
          >
            <span
              className="absolute inset-0 opacity-60 mix-blend-overlay"
              style={{ backgroundImage: TICKET_GRAIN }}
            />
          </div>

          <div className="grid gap-5 px-5 py-6 sm:px-6">
            <FormField
              control={form.control}
              name="churchName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Хамрагддаг цуглаан</FormLabel>
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

            <FormField
              control={form.control}
              name="fullName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Бүтэн нэр</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Бат-Эрдэнэ Ганбаяр"
                      autoComplete="name"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          phoneRef.current?.focus();
                        }
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid gap-5 sm:grid-cols-2 sm:gap-4">
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Утас</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        ref={(el) => {
                          field.ref(el);
                          phoneRef.current = el;
                        }}
                        inputMode="tel"
                        autoComplete="tel-national"
                        maxLength={8}
                        placeholder="99112233"
                        onChange={(e) =>
                          field.onChange(e.target.value.replace(/\D/g, "").slice(0, 8))
                        }
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            gradeRef.current?.focus();
                          }
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                    {phoneTaken && (
                      <Link
                        href="/event/status"
                        className="-my-2 inline-flex min-h-11 w-fit items-center text-xs font-semibold text-[#F98C01] underline underline-offset-2"
                      >
                        Тасалбараа шалгах
                      </Link>
                    )}
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="grade"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Анги</FormLabel>
                    <Select
                      value={field.value ?? undefined}
                      onValueChange={field.onChange}
                    >
                      <FormControl>
                        <SelectTrigger
                          ref={gradeRef}
                          onBlur={field.onBlur}
                          className="w-full"
                        >
                          <SelectValue placeholder="Сонгох" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {GRADE_CHOICES.map((choice) => (
                          <SelectItem key={choice} value={choice}>
                            {gradeChoiceLabel(choice)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        </div>

        <Button
          type="submit"
          disabled={submitting}
          className="h-12 w-full bg-[#F98C01] text-base font-bold hover:bg-[#e07d00]"
        >
          {submitting && <Loader2 className="size-4 animate-spin" />}
          {submitting ? "Бүртгэж байна…" : "Бүртгүүлэх"}
        </Button>
        <p className="text-center text-xs text-neutral-500">
          Бүртгүүлмэгц тасалбар тань шууд гарч ирнэ.
        </p>
      </form>
    </Form>
  );
}
