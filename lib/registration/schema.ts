import { z } from "zod";

import { GRADE_CHOICES } from "@/lib/registration/grade";

// Mongolian mobile numbers: 8 digits, commonly starting 5/6/7/8/9.
export const phoneSchema = z
  .string()
  .trim()
  .regex(/^[5-9]\d{7}$/, "8 оронтой утасны дугаар оруулна уу");

export const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .email("Имэйл хаягаа зөв оруулна уу");

// One person attending. Deliberately small: church is asked once for the
// whole registration (everyone in one submission comes from one church) and
// the ticket email is asked once on the payer, so adding a second teen costs
// three fields, not seven.
export const attendeeSchema = z.object({
  fullName: z.string().trim().min(2, "Нэрээ бүтнээр нь оруулна уу").max(120),
  phone: z
    .union([phoneSchema, z.literal("")])
    .optional()
    .transform((v) => (v ? v : undefined)),
  // Rendered as a select, so any failure here means "nothing chosen".
  // A school year and "youth leader" answer the same question on the form
  // and are split into their two columns on the way to the database.
  grade: z.enum(GRADE_CHOICES, { error: "Ангиа сонгоно уу" }),
});

export type Attendee = z.infer<typeof attendeeSchema>;

// Two ways to be paid for the same registration: Byl's hosted checkout
// (card / QPay, with a redirect back to the ticket page) or a Byl invoice,
// which carries a description we choose onto the payer's bank statement.
export const PAYMENT_METHODS = ["checkout", "invoice"] as const;
export type PaymentMethod = (typeof PAYMENT_METHODS)[number];

export const createRegistrationSchema = z
  .object({
    paymentMethod: z.enum(PAYMENT_METHODS).default("checkout"),
    // Derived from the attendee count rather than picked by the user: one
    // person means they're registering themselves, more than one means
    // someone is registering on their behalf.
    registrantType: z.enum(["individual", "church_leader"]),
    churchName: z.string().trim().min(2, "Хамаарах сүмээ сонгоно уу").max(160),
    payerName: z.string().trim().min(2, "Нэрээ бүтнээр нь оруулна уу").max(120),
    payerPhone: phoneSchema,
    payerEmail: emailSchema,
    attendees: z
      .array(attendeeSchema)
      .min(1, "Хамгийн багадаа 1 хүн бүртгүүлнэ")
      .max(50),
  })
  .superRefine((data, ctx) => {
    if (data.registrantType !== "individual") return;

    if (data.attendees.length !== 1) {
      ctx.addIssue({
        code: "custom",
        path: ["attendees"],
        message: "Хувиараа бүртгүүлэхэд зөвхөн 1 хүн бүртгэнэ",
      });
    }

    // A lone registrant is their own payer, so their phone is what the
    // status lookup and any follow-up call will use — it can't be blank.
    if (!data.attendees[0]?.phone) {
      ctx.addIssue({
        code: "custom",
        path: ["attendees", 0, "phone"],
        message: "Утасны дугаараа оруулна уу",
      });
    }
  });

// Output type (after zod coercion) — what the API route works with.
export type CreateRegistrationInput = z.infer<typeof createRegistrationSchema>;

/**
 * What the form itself holds. It deliberately differs from the API contract
 * above: nobody picks a registrant type, and a lone registrant never sees
 * payer fields — those are derived by `toCreateRegistrationInput` on submit.
 * Keeping them out of the form means a validation error can never land on a
 * field that isn't on screen.
 */
export const registrationFormSchema = z
  .object({
    // Declared in the order the fields appear on screen. Zod reports issues
    // in key order, so this is what makes "the first field that failed" —
    // the one the form scrolls to, and the one reported to analytics — mean
    // the topmost one rather than an arbitrary one.
    churchName: z.string().trim().min(2, "Хамаарах сүмээ сонгоно уу").max(160),
    attendees: z
      .array(attendeeSchema)
      .min(1, "Хамгийн багадаа 1 хүн бүртгүүлнэ")
      .max(50),
    payerEmail: emailSchema,
    payerName: z.string().trim().max(120).optional(),
    payerPhone: z
      .union([phoneSchema, z.literal("")])
      .optional()
      .transform((v) => (v ? v : undefined)),
  })
  .superRefine((data, ctx) => {
    if (data.attendees.length > 1) {
      // Someone is registering on others' behalf, so they have to identify
      // themselves — none of the attendees is the payer.
      if (!data.payerName || data.payerName.length < 2) {
        ctx.addIssue({
          code: "custom",
          path: ["payerName"],
          message: "Нэрээ бүтнээр нь оруулна уу",
        });
      }
      if (!data.payerPhone) {
        ctx.addIssue({
          code: "custom",
          path: ["payerPhone"],
          message: "8 оронтой утасны дугаар оруулна уу",
        });
      }
      return;
    }

    // A lone registrant is their own payer, so their phone is what the
    // status lookup and any follow-up call will use — it can't be blank.
    if (!data.attendees[0]?.phone) {
      ctx.addIssue({
        code: "custom",
        path: ["attendees", 0, "phone"],
        message: "Утасны дугаараа оруулна уу",
      });
    }
  });

/** Validated form values (after zod coercion). */
export type RegistrationFormOutput = z.output<typeof registrationFormSchema>;

/** What react-hook-form's controlled inputs actually hold, before coercion. */
export type RegistrationFormValues = z.input<typeof registrationFormSchema>;

/**
 * Fills in the fields the form never asks for. One attendee means they
 * registered themselves and their own name and phone are the payer's; more
 * than one means whoever filled the payer block is organising for a church.
 */
export function toCreateRegistrationInput(
  values: RegistrationFormOutput,
  paymentMethod: PaymentMethod = "checkout",
): CreateRegistrationInput {
  const isGroup = values.attendees.length > 1;
  const first = values.attendees[0];

  return {
    paymentMethod,
    registrantType: isGroup ? "church_leader" : "individual",
    churchName: values.churchName,
    payerName: isGroup ? (values.payerName ?? "") : first.fullName,
    payerPhone: isGroup ? (values.payerPhone ?? "") : (first.phone ?? ""),
    payerEmail: values.payerEmail,
    attendees: values.attendees,
  };
}

export const lookupSchema = z.object({
  phone: phoneSchema,
});

export function normalizePhone(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  // Strip a leading country code (976) if present, keep the last 8 digits.
  return digits.length > 8 ? digits.slice(-8) : digits;
}
