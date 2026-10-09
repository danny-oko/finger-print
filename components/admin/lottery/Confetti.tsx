"use client";

import * as React from "react";

const COLORS = ["#F98C01", "#F9A43A", "#FFD08A", "#FFFFFF"];
const DURATION_MS = 3200;
const GRAVITY = 1500;

type Piece = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  w: number;
  h: number;
  color: string;
  angle: number;
  spin: number;
  flip: number;
};

function burst(
  pieces: Piece[],
  x: number,
  y: number,
  direction: number,
  count: number,
  speed: number,
) {
  for (let i = 0; i < count; i++) {
    const angle = direction + (Math.random() - 0.5) * 0.9;
    const v = speed * (0.55 + Math.random() * 0.6);
    pieces.push({
      x,
      y,
      vx: Math.cos(angle) * v,
      vy: Math.sin(angle) * v,
      w: 7 + Math.random() * 8,
      h: 4 + Math.random() * 4,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      angle: Math.random() * Math.PI * 2,
      spin: (Math.random() - 0.5) * 14,
      flip: Math.random() * Math.PI * 2,
    });
  }
}

/** Fires once each time `fireKey` changes to a new non-null value. */
export function Confetti({ fireKey }: { fireKey: string | null }) {
  const canvas = React.useRef<HTMLCanvasElement>(null);

  React.useEffect(() => {
    if (!fireKey) return;
    const el = canvas.current;
    const ctx = el?.getContext("2d");
    if (!el || !ctx) return;

    const width = window.innerWidth;
    const height = window.innerHeight;
    const dpr = window.devicePixelRatio || 1;
    el.width = width * dpr;
    el.height = height * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const pieces: Piece[] = [];
    const speed = Math.max(height, width * 0.55, 600) * 2.1;
    const count = width < 640 ? 60 : 110;
    burst(pieces, 0, height * 0.85, -0.3 * Math.PI, count, speed);
    burst(pieces, width, height * 0.85, -0.7 * Math.PI, count, speed);

    const start = performance.now();
    let last = start;
    let frame = 0;

    const step = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      const fade = Math.min(1, Math.max(0, (DURATION_MS - (now - start)) / 900));
      const drag = Math.exp(-2.2 * dt);

      ctx.clearRect(0, 0, width, height);
      ctx.globalAlpha = fade;
      for (const p of pieces) {
        p.vx *= drag;
        p.vy = p.vy * drag + GRAVITY * dt;
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.angle += p.spin * dt;
        p.flip += 9 * dt;

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.angle);
        ctx.scale(1, Math.cos(p.flip));
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        ctx.restore();
      }

      if (now - start < DURATION_MS) {
        frame = requestAnimationFrame(step);
      } else {
        ctx.clearRect(0, 0, width, height);
      }
    };

    frame = requestAnimationFrame(step);
    return () => {
      cancelAnimationFrame(frame);
      ctx.clearRect(0, 0, width, height);
    };
  }, [fireKey]);

  return (
    <canvas
      ref={canvas}
      aria-hidden
      className="pointer-events-none fixed inset-0 z-50 h-full w-full"
    />
  );
}
