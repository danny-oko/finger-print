"use client";

import type { OutcomeTone } from "@/lib/admin/checkIn";

// Door staff look at the person, not the phone. A scan has to be legible
// without watching the screen, so every outcome buzzes and beeps differently
// — one short note for "in", a stutter for anything that needs a second look.

const VIBRATION: Record<OutcomeTone, number[]> = {
  success: [45],
  warning: [50, 70, 50],
  danger: [90, 70, 90, 70, 90],
};

const BEEP: Record<OutcomeTone, { hz: number; beeps: number }> = {
  success: { hz: 880, beeps: 1 },
  warning: { hz: 620, beeps: 2 },
  danger: { hz: 300, beeps: 3 },
};

const BEEP_MS = 110;
const GAP_MS = 80;

let context: AudioContext | null = null;

function audioContext(): AudioContext | null {
  if (context) return context;

  const Ctor =
    window.AudioContext ??
    (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;

  if (!Ctor) return null;

  try {
    context = new Ctor();
    return context;
  } catch {
    return null;
  }
}

/**
 * Browsers refuse to make noise until the page has been touched. Arming it
 * on the first tap means the first *scan* already has a sound, instead of
 * the staff discovering halfway through the queue that it beeps now.
 */
export function armScanSound(): void {
  const ctx = audioContext();
  if (ctx?.state === "suspended") void ctx.resume().catch(() => {});
}

export function playScanFeedback(tone: OutcomeTone): void {
  navigator.vibrate?.(VIBRATION[tone]);

  const ctx = audioContext();
  if (!ctx || ctx.state !== "running") return;

  const { hz, beeps } = BEEP[tone];

  for (let index = 0; index < beeps; index++) {
    const startAt = ctx.currentTime + (index * (BEEP_MS + GAP_MS)) / 1000;
    const endAt = startAt + BEEP_MS / 1000;

    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();

    oscillator.type = "sine";
    oscillator.frequency.value = hz;

    // Ramped rather than switched, so a rapid queue doesn't turn into a
    // series of clicks.
    gain.gain.setValueAtTime(0.0001, startAt);
    gain.gain.exponentialRampToValueAtTime(0.25, startAt + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, endAt);

    oscillator.connect(gain).connect(ctx.destination);
    oscillator.start(startAt);
    oscillator.stop(endAt + 0.02);
  }
}
