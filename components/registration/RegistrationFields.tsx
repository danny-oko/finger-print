"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Plus } from "lucide-react";
import * as React from "react";
import {
  useFieldArray,
  useForm,
  useWatch,
  type DefaultValues,
  type FieldErrors,
  type Resolver,
} from "react-hook-form";
import { toast } from "sonner";

import { AttendeeRow, onlyDigits } from "@/components/registration/AttendeeRow";
import { ChurchCombobox } from "@/components/registration/ChurchCombobox";
import { advanceOnFullPhone, focusNextField } from "@/components/registration/focusNextField";
import { FIELD_CLASS, FormStep, LABEL_CLASS } from "@/components/registration/FormStep";
import { ModeChoice } from "@/components/registration/ModeChoice";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useTakenPhones } from "@/hooks/use-taken-phones";
import {
  PHONE_TAKEN_MESSAGE,
  registrationFormSchema,
  type RegistrationFormOutput,
  type RegistrationFormValues,
  type RegistrationMode,
} from "@/lib/registration/schema";

// The fields and their rules, shared by the public form and the admin
// panel's "new registration". What happens on submit is each caller's own.

type Attendee = RegistrationFormValues["attendees"][number];

const BLANK_ATTENDEE = { fullName: "", phone: "", grade: undefined } as unknown as Attendee;

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

export const EMPTY_REGISTRATION: DefaultValues<RegistrationFormValues> = {
  mode: "self",
  churchName: "",
  payerName: "",
  payerPhone: "",
  attendees: [BLANK_ATTENDEE],
};

export function useRegistrationForm({
  onAttendeeAdded,
}: { onAttendeeAdded?: (attendees: number) => void } = {}) {
  const isTakenRef = React.useRef<(phone: string) => boolean>(() => false);
  const resolver = useTakenPhoneResolver(isTakenRef);

  const form = useForm<RegistrationFormValues, unknown, RegistrationFormOutput>({
    resolver,
    mode: "onTouched",
    defaultValues: EMPTY_REGISTRATION,
  });

  const { fields, append, remove, replace } = useFieldArray({
    control: form.control,
    name: "attendees",
  });

  const mode = useWatch({ control: form.control, name: "mode" }) ?? "self";

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
    onAttendeeAdded?.(fields.length + 1);
  }

  return { form, fields, remove, mode, focusIndex, changeMode, addAttendee };
}

export type RegistrationFormState = ReturnType<typeof useRegistrationForm>;

export function showInvalidFields() {
  toast.error("Бөглөөгүй эсвэл буруу талбар байна", {
    description: "Улаанаар тэмдэглэсэн хэсгийг шалгана уу.",
  });
  requestAnimationFrame(() =>
    document
      .querySelector("[aria-invalid='true']")
      ?.scrollIntoView({ behavior: "smooth", block: "center" }),
  );
}

export function RegistrationFields({
  state,
  churches,
  onCreateChurch,
}: {
  state: RegistrationFormState;
  churches: string[];
  onCreateChurch: (name: string) => void;
}) {
  const { form, fields, remove, mode, focusIndex, changeMode, addAttendee } = state;
  const isGroup = mode === "group";

  return (
    <>
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
                  churches={churches}
                  onChange={(v) => form.setValue("churchName", v, { shouldValidate: true })}
                  onCreate={onCreateChurch}
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
    </>
  );
}
