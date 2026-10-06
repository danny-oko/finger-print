const FIELDS =
  "input:not([type=hidden]):not(:disabled), button[role=combobox]:not(:disabled)";

export function focusNextField(from: HTMLElement | null) {
  const form = from?.closest("form");
  if (!from || !form) return;
  const fields = Array.from(form.querySelectorAll<HTMLElement>(FIELDS));
  fields[fields.indexOf(from) + 1]?.focus();
}

// Advance only on the keystroke that completes the number, so editing a full
// number doesn't keep throwing focus forward.
export function advanceOnFullPhone(prev: string | undefined, next: string, el: HTMLElement) {
  if (next.length === 8 && (prev ?? "").length < 8) focusNextField(el);
}
