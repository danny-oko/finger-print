import { isCloseChurchName, isSameChurchName } from "@/lib/registration/churchName";
import { PRAISE_TEAM, YOUTH_LEADER } from "@/lib/registration/grade";

// Groups that serve at the conference rather than attend it, so they never
// go into the draw. The praise team has its own role now, but people who
// registered before that typed it as their church — matched the way the
// monitor groups churches, so "магтаалын баг", "Magtaalyn bag" or a
// one-letter typo are all caught.
export const EXCLUDED_CHURCHES = ["Магтаалын баг"];

export function isExcludedChurch(churchName: string): boolean {
  return EXCLUDED_CHURCHES.some(
    (excluded) => isSameChurchName(churchName, excluded) || isCloseChurchName(churchName, excluded),
  );
}

export function canWinLottery(attendee: { role: string; churchName: string }): boolean {
  return (
    attendee.role !== YOUTH_LEADER &&
    attendee.role !== PRAISE_TEAM &&
    !isExcludedChurch(attendee.churchName)
  );
}
