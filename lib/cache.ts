// In-process memo for values every request wants and few requests change:
// prices, the registration switch, the church list. A rush of several
// hundred people opening the form costs one D1 read per instance per TTL
// instead of one per person, and concurrent misses share a single load.

type Entry<T> = { value: T; expiresAt: number };

export type Cached<T> = {
  (): Promise<T>;
  invalidate(): void;
};

export function cached<T>(
  ttlMs: number,
  load: () => Promise<T>,
  { staleOnErrorMs = 5 * 60_000 }: { staleOnErrorMs?: number } = {},
): Cached<T> {
  let entry: Entry<T> | null = null;
  let inFlight: Promise<T> | null = null;

  const get = (async () => {
    const now = Date.now();
    if (entry && entry.expiresAt > now) return entry.value;
    if (inFlight) return inFlight;

    inFlight = load()
      .then((value) => {
        entry = { value, expiresAt: Date.now() + ttlMs };
        return value;
      })
      .catch((error) => {
        // A value a few minutes old beats an error page while D1 recovers.
        if (entry && Date.now() - entry.expiresAt < staleOnErrorMs) return entry.value;
        throw error;
      })
      .finally(() => {
        inFlight = null;
      });

    return inFlight;
  }) as Cached<T>;

  get.invalidate = () => {
    entry = null;
  };

  return get;
}
