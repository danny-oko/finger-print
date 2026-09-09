import { z } from "zod";

import { GRADE_CHOICES } from "@/lib/registration/grade";
import { phoneSchema } from "@/lib/registration/schema";

// What an admin can set on one attendee. Same shape whether they're adding
// someone to an existing registration or fixing a misspelled name, so the
// dialog and both API routes agree without a second definition.
export const adminAttendeeSchema = z.object({
  fullName: z.string().trim().min(2, "Нэрийг бүтнээр нь оруулна уу").max(120),
  grade: z.enum(GRADE_CHOICES, { error: "Ангийг сонгоно уу" }),
  churchName: z.string().trim().min(2, "Цуглааныг сонгоно уу").max(160),
  phone: z
    .union([phoneSchema, z.literal("")])
    .optional()
    .transform((v) => (v ? v : undefined)),
});

export type AdminAttendeeValues = z.input<typeof adminAttendeeSchema>;
export type AdminAttendeeInput = z.output<typeof adminAttendeeSchema>;

export const addAttendeeSchema = adminAttendeeSchema.extend({
  registrationId: z.string().trim().min(1),
});
