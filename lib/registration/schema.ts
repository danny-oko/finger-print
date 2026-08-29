import { z } from "zod";

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

export const attendeeSchema = z.object({
  fullName: z.string().trim().min(2, "Нэрээ бүтнээр нь оруулна уу").max(120),
  age: z.coerce
    .number()
    .int()
    .min(10, "Насаа зөв оруулна уу")
    .max(19, "Насаа зөв оруулна уу"),
  phone: z
    .union([phoneSchema, z.literal("")])
    .optional()
    .transform((v) => (v ? v : undefined)),
  email: z
    .union([emailSchema, z.literal("")])
    .optional()
    .transform((v) => (v ? v : undefined)),
  parentPhone: phoneSchema,
  churchName: z.string().trim().min(2, "Хамаарах сүмээ сонгоно уу").max(160),
  grade: z.coerce.number().int().min(7).max(12),
});

export type Attendee = z.infer<typeof attendeeSchema>;

export const createRegistrationSchema = z
  .object({
    registrantType: z.enum(["individual", "church_leader"]),
    payerName: z.string().trim().min(2, "Нэрээ бүтнээр нь оруулна уу").max(120),
    payerPhone: phoneSchema,
    payerEmail: emailSchema,
    attendees: z.array(attendeeSchema).min(1, "Хамгийн багадаа 1 хүн бүртгүүлнэ").max(50),
  })
  .superRefine((data, ctx) => {
    if (data.registrantType === "individual") {
      if (data.attendees.length !== 1) {
        ctx.addIssue({
          code: "custom",
          path: ["attendees"],
          message: "Хувиараа бүртгүүлэхэд зөвхөн 1 хүн бүртгэнэ",
        });
      }
      if (!data.attendees[0]?.phone) {
        ctx.addIssue({
          code: "custom",
          path: ["attendees", 0, "phone"],
          message: "Утасны дугаараа оруулна уу",
        });
      }
      if (!data.attendees[0]?.email) {
        ctx.addIssue({
          code: "custom",
          path: ["attendees", 0, "email"],
          message: "Имэйл хаягаа оруулна уу — тасалбараа энд илгээнэ",
        });
      }
    }
  });

// Output type (after zod coercion) — what the API route works with.
export type CreateRegistrationInput = z.infer<typeof createRegistrationSchema>;

// Input type (before coercion) — what react-hook-form's controlled inputs
// actually hold, e.g. `age`/`grade` are typed loosely because they come from
// `z.coerce.number()`. The zodResolver validates/coerces on submit.
export type RegistrationFormValues = z.input<typeof createRegistrationSchema>;

export const lookupSchema = z.object({
  phone: phoneSchema,
});

export function normalizePhone(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  // Strip a leading country code (976) if present, keep the last 8 digits.
  return digits.length > 8 ? digits.slice(-8) : digits;
}
