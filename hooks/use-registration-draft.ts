"use client";

import * as React from "react";
import type { UseFormReturn } from "react-hook-form";

import { trackEvent } from "@/lib/analytics/client";
import type {
  RegistrationFormOutput,
  RegistrationFormValues,
} from "@/lib/registration/schema";

const STORAGE_KEY = "fp-registration-draft-v1";
const SAVE_DEBOUNCE_MS = 400;

/**
 * Wipes the saved draft. Called from the registration detail page once the
 * payment has landed — not on the way out to checkout, since a bank transfer
 * or an abandoned card payment brings people back to the form, and re-typing
 * twenty teens is exactly what the draft exists to prevent.
 */
export function clearRegistrationDraft() {
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Nothing to clean up if storage is unavailable.
  }
}

/**
 * Keeps the in-progress registration in localStorage. A church leader
 * entering twenty teens on a phone is one accidental back-swipe away from
 * losing all of it otherwise; the draft is per-browser and lives until the
 * registration it belongs to is paid for.
 *
 * Restore is best-effort by design — a draft written by an older version of
 * the form may not fit the current fields, so anything unparseable is
 * dropped rather than allowed to wedge the form.
 */
export function useRegistrationDraft(
  form: UseFormReturn<RegistrationFormValues, unknown, RegistrationFormOutput>,
) {
  React.useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const draft = JSON.parse(raw) as Partial<RegistrationFormValues>;
        if (Array.isArray(draft.attendees) && draft.attendees.length > 0) {
          form.reset({ ...form.getValues(), ...draft });
          trackEvent("registration_draft_restored", {
            attendees: draft.attendees.length,
          });
        }
      }
    } catch {
      // Corrupt or foreign draft — start clean.
    }

    // Subscribed after the restore above so replaying the draft doesn't
    // immediately write it back.
    let timer: ReturnType<typeof setTimeout>;
    const subscription = form.watch((values) => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        try {
          window.localStorage.setItem(STORAGE_KEY, JSON.stringify(values));
        } catch {
          // Private mode or a full quota — the form still works, it just
          // won't survive a reload.
        }
      }, SAVE_DEBOUNCE_MS);
    });

    return () => {
      clearTimeout(timer);
      subscription.unsubscribe();
    };
  }, [form]);

  return { clearDraft: clearRegistrationDraft };
}
