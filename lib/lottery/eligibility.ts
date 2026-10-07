import { isCloseChurchName, isSameChurchName } from "@/lib/registration/churchName";
import { YOUTH_LEADER } from "@/lib/registration/grade";

// Groups that serve at the conference rather than attend it, so they never
// go into the draw. Matched the way the monitor groups churches, so "магтаалын
// баг", "Magtaalyn bag" or a one-letter typo are all caught.
export const EXCLUDED_CHURCHES = ["Магтаалын баг"];

export function isExcludedChurch(churchName: string): boolean {
  return EXCLUDED_CHURCHES.some(
    (excluded) => isSameChurchName(churchName, excluded) || isCloseChurchName(churchName, excluded),
  );
}

export function canWinLottery(attendee: { role: string; churchName: string }): boolean {
  return attendee.role !== YOUTH_LEADER && !isExcludedChurch(attendee.churchName);
}
