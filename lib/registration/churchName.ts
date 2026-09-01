// Fuzzy-matching for church names so "Номин сүм", "nomin sum", "Номин Сүм-2",
// and "NOMIN SUM!!" are all recognized as (probably) the same church instead
// of piling up as separate rows every time someone types it slightly
// differently.

// Mongolian Cyrillic -> Latin, close enough for similarity comparisons only
// (never used for display/storage — the user's own spelling is always kept).
const MN_TO_LATIN: Record<string, string> = {
  а: "a", б: "b", в: "v", г: "g", д: "d", е: "e", ё: "yo", ж: "j", з: "z",
  и: "i", й: "i", к: "k", л: "l", м: "m", н: "n", о: "o", ө: "u", п: "p",
  р: "r", с: "s", т: "t", у: "u", ү: "u", ф: "f", х: "h", ц: "ts", ч: "ch",
  ш: "sh", щ: "sh", ъ: "", ы: "i", ь: "", э: "e", ю: "yu", я: "ya",
};

function transliterate(input: string): string {
  return input
    .toLowerCase()
    .split("")
    .map((ch) => MN_TO_LATIN[ch] ?? ch)
    .join("");
}

/**
 * Normalizes a church name for comparison: transliterates Mongolian Cyrillic
 * to Latin, turns anything that isn't a letter (digits, punctuation, dashes)
 * into a word separator, and collapses whitespace — so "Nomin-Sum", "Nomin
 * Sum 2", and "nomin   sum" all normalize to "nomin sum".
 */
export function normalizeChurchName(input: string): string {
  return transliterate(input)
    .replace(/[^a-z]+/g, " ")
    .trim();
}

function levenshteinDistance(a: string, b: string): number {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;

  let prevRow = Array.from({ length: b.length + 1 }, (_, j) => j);

  for (let i = 1; i <= a.length; i++) {
    const currentRow = [i];
    for (let j = 1; j <= b.length; j++) {
      currentRow[j] =
        a[i - 1] === b[j - 1]
          ? prevRow[j - 1]
          : 1 + Math.min(prevRow[j - 1], prevRow[j], currentRow[j - 1]);
    }
    prevRow = currentRow;
  }

  return prevRow[b.length];
}

/** True when two names normalize to the exact same thing (case/punctuation/script only). */
export function isSameChurchName(a: string, b: string): boolean {
  const na = normalizeChurchName(a);
  const nb = normalizeChurchName(b);
  return na.length > 0 && na === nb;
}

// Allow roughly one typo per 4 characters, at least 1, capped so very long
// names don't get an unreasonably loose threshold.
function distanceThreshold(length: number): number {
  return Math.min(4, Math.max(1, Math.floor(length * 0.25)));
}

// Below this, near-identical short strings ("A" vs "B") would trip the
// distance threshold despite sharing no real similarity — require enough
// characters for edit distance to actually mean something.
const MIN_LENGTH_FOR_FUZZY_MATCH = 3;

/** True when two *different* normalized names are still close enough to likely be the same church. */
export function isCloseChurchName(a: string, b: string): boolean {
  const na = normalizeChurchName(a);
  const nb = normalizeChurchName(b);
  if (na.length < MIN_LENGTH_FOR_FUZZY_MATCH || nb.length < MIN_LENGTH_FOR_FUZZY_MATCH) return false;
  if (na === nb) return false;

  const distance = levenshteinDistance(na, nb);
  return distance <= distanceThreshold(Math.min(na.length, nb.length));
}

/**
 * Finds existing church names that are probably the same church as `input`
 * typed slightly differently — different case, stray digits/punctuation, a
 * typo, or transliterated between Mongolian Cyrillic and Latin script.
 * Excludes exact (normalized) matches, since those should just be selected
 * outright rather than offered as a "did you mean" suggestion.
 */
export function findCloseChurchNames(
  input: string,
  churches: string[],
  limit = 5,
): string[] {
  const normalizedInput = normalizeChurchName(input);
  if (!normalizedInput) return [];

  return churches
    .filter((church) => isCloseChurchName(input, church))
    .map((church) => ({
      church,
      distance: levenshteinDistance(normalizedInput, normalizeChurchName(church)),
    }))
    .sort((a, b) => a.distance - b.distance)
    .slice(0, limit)
    .map(({ church }) => church);
}
