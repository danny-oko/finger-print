"use client";

import * as React from "react";

const VALID_PHONE = /^[5-9]\d{7}$/;

/**
 * Asks the server which of the phones on the form already belong to someone
 * attending, so a duplicate surfaces under the field instead of after the
 * review dialog. Answers are cached for the life of the form, so correcting
 * a typo and typing the number back costs nothing.
 *
 * Returns a predicate whose identity changes whenever a new answer lands —
 * that's the signal the form revalidates on.
 */
export function useTakenPhones(phones: string[]) {
  const answers = React.useRef(new Map<string, boolean>());
  const inFlight = React.useRef(new Set<string>());
  const [version, setVersion] = React.useState(0);

  const key = phones.join(",");

  React.useEffect(() => {
    const pending = key
      .split(",")
      .filter(
        (p) =>
          VALID_PHONE.test(p) &&
          !answers.current.has(p) &&
          !inFlight.current.has(p),
      );

    if (pending.length === 0) return;

    // Debounced, so typing an eight-digit number costs one request, not six.
    const timer = setTimeout(async () => {
      const asked = [...new Set(pending)];
      asked.forEach((p) => inFlight.current.add(p));

      try {
        const res = await fetch(
          `/api/registration/phone-check?phones=${asked.join(",")}`,
        );
        const data = (await res.json()) as { taken?: string[] };
        if (!res.ok || !Array.isArray(data.taken)) throw new Error("check failed");

        const taken = new Set(data.taken);
        asked.forEach((p) => answers.current.set(p, taken.has(p)));
        setVersion((v) => v + 1);
      } catch {
        // Offline, or the check is down. Staying quiet is right: the create
        // route repeats this check, so the cost is a later error rather than
        // a duplicate registration — and nobody is blocked meanwhile.
      } finally {
        asked.forEach((p) => inFlight.current.delete(p));
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [key]);

  return React.useCallback(
    (phone: string) => answers.current.get(phone) === true,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [version],
  );
}
