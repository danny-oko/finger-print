"use client";

import * as React from "react";

import { scanTicket } from "@/lib/admin/actions";
import type { CheckInResponse } from "@/lib/admin/checkIn";

const STORAGE_KEY = "fp-door-pending-v1";
const FLUSH_EVERY_MS = 5000;

export type PendingScan = { code: string; scannedAt: string };

function load(): PendingScan[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? (JSON.parse(raw) as PendingScan[]) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function save(scans: PendingScan[]) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(scans));
  } catch {
    // Storage full or blocked — the scans still live in memory.
  }
}

export function useOfflineScans(onSettled: (response: CheckInResponse, scan: PendingScan) => void) {
  const [pending, setPending] = React.useState<PendingScan[]>([]);
  const flushing = React.useRef(false);
  const settledRef = React.useRef(onSettled);

  React.useEffect(() => {
    settledRef.current = onSettled;
  });

  React.useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- restoring from storage once on mount
    setPending(load());
  }, []);

  const enqueue = React.useCallback((code: string) => {
    setPending((current) => {
      if (current.some((scan) => scan.code === code)) return current;
      const next = [...current, { code, scannedAt: new Date().toISOString() }];
      save(next);
      return next;
    });
  }, []);

  const flush = React.useCallback(async () => {
    if (flushing.current) return;
    flushing.current = true;

    try {
      for (const scan of load()) {
        const response = await scanTicket(scan.code);
        if (!response.ok) {
          if (response.offline) break;
          continue;
        }

        const rest = load().filter((s) => s.code !== scan.code);
        save(rest);
        setPending(rest);
        settledRef.current(response.data, scan);
      }
    } finally {
      flushing.current = false;
    }
  }, []);

  React.useEffect(() => {
    if (pending.length === 0) return;
    const timer = setInterval(() => void flush(), FLUSH_EVERY_MS);
    window.addEventListener("online", flush);
    return () => {
      clearInterval(timer);
      window.removeEventListener("online", flush);
    };
  }, [pending.length, flush]);

  return { pending, enqueue, flush };
}
