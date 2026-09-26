export const FRIEND_NAME_MAX = 20;

// The share preview is drawn in Inter, which only carries Latin and Cyrillic —
// anything else (emoji, hangul) would come out as empty boxes on the card.
const OUTSIDE_CARD_FONT = /[^\p{Script=Latin}\p{Script=Cyrillic}\d .'-]/gu;

export function cleanFriendName(
  raw: string | string[] | null | undefined,
): string | null {
  const value = Array.isArray(raw) ? raw[0] : raw;
  if (!value) return null;

  const name = value
    .replace(OUTSIDE_CARD_FONT, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, FRIEND_NAME_MAX)
    .trim();

  return name || null;
}

export function comePath(to: string | null): string {
  return to ? `/come?to=${encodeURIComponent(to)}` : "/come";
}
