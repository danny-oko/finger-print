import { describe, expect, it } from "vitest";

import { parseTicketCode } from "@/lib/admin/checkIn";
import { detectLang } from "@/lib/i18n/lang";
import { computePricing } from "@/lib/registration/pricing";
import {
  registrationFormSchema,
  toCreateRegistrationInput,
  type RegistrationFormOutput,
} from "@/lib/registration/schema";

const person = (fullName: string, phone = "") => ({ fullName, phone, grade: "9" as const });

describe("registration form", () => {
  it("requires a phone when registering yourself", () => {
    const result = registrationFormSchema.safeParse({
      mode: "self",
      churchName: "Тест сүм",
      attendees: [person("Тэмүүлэн Бат")],
    });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0].path).toEqual(["attendees", 0, "phone"]);
  });

  it("requires the contact person in group mode, not attendee phones", () => {
    const result = registrationFormSchema.safeParse({
      mode: "group",
      churchName: "Тест сүм",
      attendees: [person("Нэг"), person("Хоёр")],
    });
    expect(result.success).toBe(false);
    expect(result.error?.issues.map((i) => i.path[0])).toEqual(["payerName", "payerPhone"]);
  });

  it("flags the same phone used twice", () => {
    const result = registrationFormSchema.safeParse({
      mode: "group",
      churchName: "Тест сүм",
      payerName: "Ахлагч",
      payerPhone: "99112233",
      attendees: [person("Нэг", "88112233"), person("Хоёр", "88112233")],
    });
    expect(result.error?.issues[0].path).toEqual(["attendees", 1, "phone"]);
  });

  it("turns a group of one into a leader registration", () => {
    const values = registrationFormSchema.parse({
      mode: "group",
      churchName: "Тест сүм",
      payerName: "Ахлагч Бат",
      payerPhone: "99112233",
      attendees: [person("Хүүхэд")],
    }) as RegistrationFormOutput;
    const input = toCreateRegistrationInput(values, "checkout", "4f1c3a0e-6b8a-4d6e-9d9b-2b8f0f6f4a11");
    expect(input).toMatchObject({
      registrantType: "church_leader",
      payerName: "Ахлагч Бат",
      payerPhone: "99112233",
      idempotencyKey: "4f1c3a0e-6b8a-4d6e-9d9b-2b8f0f6f4a11",
    });
  });
});

describe("pricing", () => {
  it("adds tax on the subtotal", () => {
    expect(computePricing({ pricePerAttendeeMnt: 15000, taxRatePercent: 10, currency: "MNT" }, 3)).toMatchObject({
      subtotalMnt: 45000,
      taxMnt: 4500,
      totalMnt: 49500,
    });
  });
});

describe("ticket codes at the door", () => {
  it.each([
    ["FP-7K2Q-X9M4", "FP-7K2Q-X9M4"],
    ["fp7k2qx9m4", "FP-7K2Q-X9M4"],
    ["7K2Q X9M4", "FP-7K2Q-X9M4"],
    ["https://finger-print.org/event/ticket/FP-7K2Q-X9M4?x=1", "FP-7K2Q-X9M4"],
    ["hello", null],
  ])("%s → %s", (raw, expected) => {
    expect(parseTicketCode(raw)).toBe(expected);
  });
});

describe("first-visit language", () => {
  it("prefers the browser, then the country, then Mongolian", () => {
    expect(detectLang("ko-KR,ko;q=0.9", "MN")).toBe("ko");
    expect(detectLang("de-DE", "MN")).toBe("mn");
    expect(detectLang(null, "US")).toBe("en");
    expect(detectLang(null, null)).toBe("mn");
  });
});
