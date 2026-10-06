import { z } from "zod";

import { GRADE_CHOICES } from "@/lib/registration/grade";

// Short on purpose: these sit under the narrowest field on the row, where a
// full sentence wraps to three lines and shoves the form around.
export const PHONE_TAKEN_MESSAGE = "Бүртгэлтэй дугаар";
export const PHONE_DUPLICATE_MESSAGE = "Давхардсан дугаар";

// Mongolian mobile numbers: 8 digits, commonly starting 5/6/7/8/9.
export const phoneSchema = z
  .string()
  .trim()
  .regex(/^[5-9]\d{7}$/, "8 оронтой утасны дугаар оруулна уу");

// One person attending. Deliberately small: church is asked once for the
// whole registration (everyone in one submission comes from one church), so
// adding a second teen costs three fields, not seven.
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

// One number can't be two people. Flagged on the later row so the first one
// someone typed stays untouched.
function checkDuplicatePhones(
  attendees: { phone?: string }[],
  ctx: z.RefinementCtx,
) {
  const seen = new Set<string>();

  attendees.forEach((attendee, index) => {
    const phone = attendee.phone;
    if (!phone) return;

    if (seen.has(phone)) {
      ctx.addIssue({
        code: "custom",
        path: ["attendees", index, "phone"],
        message: PHONE_DUPLICATE_MESSAGE,
      });
    }
    seen.add(phone);
  });
}

// Two ways to be paid for the same registration: Byl's hosted checkout
// (card / QPay, with a redirect back to the ticket page) or a Byl invoice,
// which carries a description we choose onto the payer's bank statement.
export const PAYMENT_METHODS = ["checkout", "invoice"] as const;
export type PaymentMethod = (typeof PAYMENT_METHODS)[number];

// One per submission attempt, minted by the form. Lets the server recognise
// the same submission arriving twice and answer with what it already made.
const idempotencyKeySchema = z.uuid().optional();

export const createRegistrationSchema = z
  .object({
    idempotencyKey: idempotencyKeySchema,
    paymentMethod: z.enum(PAYMENT_METHODS).default("checkout"),
    // Derived from the attendee count rather than picked by the user: one
    // person means they're registering themselves, more than one means
    // someone is registering on their behalf.
    registrantType: z.enum(["individual", "church_leader"]),
    churchName: z.string().trim().min(2, "Хамаарах сүмээ сонгоно уу").max(160),
    payerName: z.string().trim().min(2, "Нэрээ бүтнээр нь оруулна уу").max(120),
    payerPhone: phoneSchema,
    attendees: z
      .array(attendeeSchema)
      .min(1, "Хамгийн багадаа 1 хүн бүртгүүлнэ")
      .max(50),
  })
  .superRefine((data, ctx) => {
    checkDuplicatePhones(data.attendees, ctx);

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

export const REGISTRATION_MODES = ["self", "group"] as const;
export type RegistrationMode = (typeof REGISTRATION_MODES)[number];

/**
 * What the form itself holds. It deliberately differs from the API contract
 * above: a lone registrant never sees payer fields — those are derived by
 * `toCreateRegistrationInput` on submit. Keeping them out of the form means
 * a validation error can never land on a field that isn't on screen.
 *
 * `mode` is the first thing the form asks: registering yourself, or a group
 * you're responsible for. It decides which fields exist and who the contact
 * person is.
 */
export const registrationFormSchema = z
  .object({
    mode: z.enum(REGISTRATION_MODES),
    // Declared in the order the fields appear on screen. Zod reports issues
    // in key order, so this is what makes "the first field that failed" —
    // the one the form scrolls to, and the one reported to analytics — mean
    // the topmost one rather than an arbitrary one.
    churchName: z.string().trim().min(2, "Хамаарах цуглаанаа сонгоно уу").max(160),
    payerName: z.string().trim().max(120).optional(),
    payerPhone: z
      .union([phoneSchema, z.literal("")])
      .optional()
      .transform((v) => (v ? v : undefined)),
    attendees: z
      .array(attendeeSchema)
      .min(1, "Хамгийн багадаа 1 хүн бүртгүүлнэ")
      .max(50, "Нэг удаад 50 хүртэл хүн бүртгэнэ"),
  })
  .superRefine((data, ctx) => {
    checkDuplicatePhones(data.attendees, ctx);

    if (data.mode === "group") {
      // Someone is registering on others' behalf, so they have to identify
      // themselves — tickets are found again by this phone number.
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
 * Fills in the fields the form never asks for. Registering yourself makes
 * your own name and phone the payer's; registering a group makes whoever
 * filled the contact block the church leader who paid.
 */
export function toCreateRegistrationInput(
  values: RegistrationFormOutput,
  paymentMethod: PaymentMethod = "checkout",
  idempotencyKey?: string,
): CreateRegistrationInput {
  const isGroup = values.mode === "group";
  const first = values.attendees[0];

  return {
    idempotencyKey,
    paymentMethod,
    registrantType: isGroup ? "church_leader" : "individual",
    churchName: values.churchName,
    payerName: isGroup ? (values.payerName ?? "") : first.fullName,
    payerPhone: isGroup ? (values.payerPhone ?? "") : (first.phone ?? ""),
    attendees: isGroup ? values.attendees : [first],
  };
}

export function normalizePhone(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  // Strip a leading country code (976) if present, keep the last 8 digits.
  return digits.length > 8 ? digits.slice(-8) : digits;
}

// The invite link registers exactly one person and never touches payment.
// The phone is required: it's how they find their ticket again on
// /event/status, and the only way to tell two invitees with the same name apart.
export const invitedRegistrationFormSchema = z.object({
  churchName: z.string().trim().min(2, "Хамаарах сүмээ сонгоно уу").max(160),
  fullName: z.string().trim().min(2, "Нэрээ бүтнээр нь оруулна уу").max(120),
  phone: phoneSchema,
  grade: z.enum(GRADE_CHOICES, { error: "Ангиа сонгоно уу" }),
});

export type InvitedRegistrationFormValues = z.input<typeof invitedRegistrationFormSchema>;
export type InvitedRegistrationFormOutput = z.output<typeof invitedRegistrationFormSchema>;

export const createInvitedRegistrationSchema = invitedRegistrationFormSchema.extend({
  token: z.string().min(1).max(200),
  idempotencyKey: idempotencyKeySchema,
});

export type CreateInvitedRegistrationInput = z.infer<typeof createInvitedRegistrationSchema>;
