"use client";

import * as React from "react";

export type QueueView =
  | { phase: "idle" }
  | { phase: "joining" }
  | { phase: "waiting"; position: number; total: number; etaSec: number };

type Answer =
  | { state: "inactive" }
  | { state: "expired" }
  | { state: "admitted"; pass: string; expiresAt: number }
  | { state: "waiting"; ticket: string; position: number; total: number; etaSec: number };

export class QueueCancelled extends Error {
  constructor() {
    super("Left the queue");
    this.name = "QueueCancelled";
  }
}

// Near the front, poll often so nobody sits on an open turn; further back,
// slower, so a long line isn't a flood of requests. Jittered so a few
// hundred phones don't all ask in the same second.
function pollDelay(position: number): number {
  const base = position <= 5 ? 2000 : position <= 30 ? 4000 : 7000;
  return base + Math.random() * 1000;
}

async function ask(body: object): Promise<Answer> {
  const res = await fetch("/api/queue", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    cache: "no-store",
  });
  if (res.status === 429) {
    const { retryAfterSec } = (await res.json().catch(() => ({}))) as { retryAfterSec?: number };
    await new Promise((r) => setTimeout(r, (retryAfterSec ?? 5) * 1000));
    return ask(body);
  }
  if (!res.ok) throw new Error(`queue ${res.status}`);
  return res.json();
}

export function useQueuePass() {
  const [view, setView] = React.useState<QueueView>({ phase: "idle" });
  const passRef = React.useRef<{ pass: string; expiresAt: number } | null>(null);
  const ticketRef = React.useRef<string | null>(null);
  const cancelRef = React.useRef<(() => void) | null>(null);

  const acquire = React.useCallback(async (): Promise<string | null> => {
    const held = passRef.current;
    if (held && held.expiresAt - Date.now() > 30_000) return held.pass;

    setView({ phase: "joining" });

    let cancelled = false;
    const cancelled$ = new Promise<never>((_, reject) => {
      cancelRef.current = () => {
        cancelled = true;
        reject(new QueueCancelled());
      };
    });

    try {
      let answer = await Promise.race([ask({}), cancelled$]);

      for (;;) {
        if (answer.state === "inactive") return null;
        if (answer.state === "admitted") {
          passRef.current = { pass: answer.pass, expiresAt: answer.expiresAt };
          return answer.pass;
        }
        if (answer.state === "expired") {
          ticketRef.current = null;
          answer = await Promise.race([ask({}), cancelled$]);
          continue;
        }

        ticketRef.current = answer.ticket;
        setView({ phase: "waiting", position: answer.position, total: answer.total, etaSec: answer.etaSec });

        await Promise.race([
          new Promise((r) => setTimeout(r, pollDelay(answer.state === "waiting" ? answer.position : 1))),
          cancelled$,
        ]);
        if (cancelled) throw new QueueCancelled();

        // A failed poll keeps the place: the ticket carries it.
        answer = await Promise.race([
          ask({ ticket: answer.ticket }).catch(() => answer),
          cancelled$,
        ]);
      }
    } finally {
      cancelRef.current = null;
      ticketRef.current = null;
      setView({ phase: "idle" });
    }
  }, []);

  const cancel = React.useCallback(() => {
    const ticket = ticketRef.current;
    cancelRef.current?.();
    if (ticket) {
      void fetch("/api/queue", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ticket }),
        keepalive: true,
      }).catch(() => {});
    }
  }, []);

  const forget = React.useCallback(() => {
    passRef.current = null;
  }, []);

  return { view, acquire, cancel, forget };
}
