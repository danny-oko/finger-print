import { describe, expect, it } from "vitest";

import { canWinLottery, isExcludedChurch } from "@/lib/lottery/eligibility";

describe("lottery eligibility", () => {
  it("keeps youth leaders out", () => {
    expect(canWinLottery({ role: "youth_leader", churchName: "Номин сүм" })).toBe(false);
    expect(canWinLottery({ role: "student", churchName: "Номин сүм" })).toBe(true);
  });

  it("keeps the praise team out however it was typed", () => {
    for (const name of ["Магтаалын баг", "магтаалын баг ", "МАГТААЛЫН БАГ", "Magtaalyn bag", "Магталын баг"]) {
      expect(isExcludedChurch(name)).toBe(true);
    }
  });

  it("doesn't catch other churches", () => {
    for (const name of ["Хайрын булаг", "Нэгдүгээр цуглаан", "Тахилт Мессиа", "Амийн талх", "Үүрдийн Гэгээ"]) {
      expect(isExcludedChurch(name)).toBe(false);
    }
  });
});
