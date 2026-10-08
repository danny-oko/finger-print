"use client";

import * as React from "react";

import { typewriter } from "@/lib/fonts";
import { easeOutCubic, planLanding, REEL_GLYPHS, reelTargets } from "@/lib/lottery/reels";
import { cn } from "@/lib/utils";

// "FP" is the same on every ticket, so only the eight characters after it spin.
const REELS = 8;
const GLYPHS = REEL_GLYPHS.length;
// Glyphs per second. Each reel runs a little faster than the one before it,
// so a spinning row never reads as the same letter eight times.
const speedOf = (reel: number) => 20 + reel * 1.5;
const MIN_SPIN_MS = 1400;
const STAGGER_MS = 260;
const MIN_LANDING_MS = 700;

type Reel =
  | { mode: "spin" }
  | { mode: "land"; from: number; distance: number; ms: number; startAt: number }
  | { mode: "still" };

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * Spins eight reels and lands them, left to right, on a ticket code. `spin`
 * starts them; `land` stops them on the code and resolves once the last one
 * is still; `stop` freezes them where they are (a failed draw).
 */
export function useReels() {
  const [positions, setPositions] = React.useState<number[] | null>(null);
  const live = React.useRef<number[]>(Array(REELS).fill(0));
  const reels = React.useRef<Reel[]>(Array(REELS).fill({ mode: "still" }));
  const frame = React.useRef<number | null>(null);
  const spunAt = React.useRef(0);
  const landed = React.useRef<(() => void) | null>(null);

  const run = React.useCallback(() => {
    if (frame.current !== null) return;
    let last = performance.now();

    const step = (now: number) => {
      const dt = (now - last) / 1000;
      last = now;
      let moving = false;

      reels.current.forEach((reel, i) => {
        if (reel.mode === "spin") {
          live.current[i] += speedOf(i) * dt;
          moving = true;
        } else if (reel.mode === "land") {
          if (now < reel.startAt) {
            live.current[i] += speedOf(i) * dt;
          } else {
            const t = Math.min(1, (now - reel.startAt) / reel.ms);
            live.current[i] = reel.from + reel.distance * easeOutCubic(t);
            if (t === 1) {
              live.current[i] = Math.round(live.current[i]);
              reels.current[i] = { mode: "still" };
            }
          }
          moving = true;
        }
      });

      setPositions([...live.current]);

      if (moving) {
        frame.current = requestAnimationFrame(step);
      } else {
        frame.current = null;
        landed.current?.();
        landed.current = null;
      }
    };

    frame.current = requestAnimationFrame(step);
  }, []);

  React.useEffect(
    () => () => {
      if (frame.current !== null) cancelAnimationFrame(frame.current);
    },
    [],
  );

  const spin = React.useCallback(() => {
    spunAt.current = performance.now();
    if (prefersReducedMotion()) return;
    live.current = live.current.map((position) => position + Math.random() * GLYPHS);
    reels.current = Array.from({ length: REELS }, () => ({ mode: "spin" }) as Reel);
    run();
  }, [run]);

  const land = React.useCallback(
    (ticketCode: string) =>
      new Promise<void>((resolve) => {
        const targets = reelTargets(ticketCode).slice(-REELS);

        if (prefersReducedMotion() || frame.current === null) {
          live.current = targets;
          reels.current = Array.from({ length: REELS }, () => ({ mode: "still" }) as Reel);
          setPositions([...targets]);
          resolve();
          return;
        }

        const now = performance.now();
        const begin = Math.max(now, spunAt.current + MIN_SPIN_MS);

        reels.current = targets.map((target, i) => {
          const startAt = begin + i * STAGGER_MS;
          // Where this reel will be when its landing starts, at full speed.
          const position = live.current[i] + (speedOf(i) * (startAt - now)) / 1000;
          const { distance, ms } = planLanding(position, speedOf(i), target, GLYPHS, MIN_LANDING_MS);
          return { mode: "land", from: position, distance, ms, startAt };
        });
        landed.current = resolve;
      }),
    [],
  );

  const stop = React.useCallback(() => {
    reels.current = Array.from({ length: REELS }, () => ({ mode: "still" }) as Reel);
    live.current = live.current.map(Math.round);
    setPositions([...live.current]);
    landed.current?.();
    landed.current = null;
  }, []);

  const show = React.useCallback((ticketCode: string | null) => {
    if (frame.current !== null) return;
    const targets = ticketCode ? reelTargets(ticketCode).slice(-REELS) : null;
    if (targets) live.current = targets;
    setPositions(targets);
  }, []);

  return { positions, spin, land, stop, show };
}

function glyph(index: number) {
  return REEL_GLYPHS[((index % GLYPHS) + GLYPHS) % GLYPHS];
}

function Reel({ position }: { position: number | null }) {
  if (position === null) {
    return (
      <span className="grid h-[1.3em] w-[1em] place-items-center rounded-[0.18em] bg-white/[0.06] text-white/25">
        ·
      </span>
    );
  }

  const base = Math.floor(position);
  const frac = position - base;

  return (
    <span
      className="relative block h-[1.3em] w-[1em] overflow-hidden rounded-[0.18em] bg-white/[0.06] [mask-image:linear-gradient(transparent,#000_22%,#000_78%,transparent)]"
      aria-hidden
    >
      {[-1, 0, 1, 2].map((k) => (
        <span
          key={k}
          className="absolute inset-x-0 grid h-[1.3em] place-items-center"
          style={{ transform: `translateY(${(k - frac) * 1.3}em)` }}
        >
          {glyph(base + k)}
        </span>
      ))}
    </span>
  );
}

export function LotteryReels({
  positions,
  label,
  className,
}: {
  positions: number[] | null;
  label: string;
  className?: string;
}) {
  const cell = (i: number) => <Reel key={i} position={positions ? positions[i] : null} />;

  return (
    <p
      role="img"
      aria-label={label}
      className={cn(
        typewriter.className,
        "flex items-center justify-center gap-[0.12em] font-bold text-white tabular-nums",
        className,
      )}
    >
      <span className="pr-[0.1em] text-[#F98C01]" aria-hidden>
        FP
      </span>
      <span className="text-white/30" aria-hidden>
        -
      </span>
      {[0, 1, 2, 3].map(cell)}
      <span className="text-white/30" aria-hidden>
        -
      </span>
      {[4, 5, 6, 7].map(cell)}
    </p>
  );
}
