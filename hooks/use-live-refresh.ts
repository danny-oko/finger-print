"use client";

import * as React from "react";

export const LIVE_REFRESH_MS = 5_000;

// Polls while the tab is visible and catches up the moment it's shown again,
// so admin screens track changes made elsewhere without a manual reload.
export function useLiveRefresh(
  refresh: () => unknown,
  { intervalMs = LIVE_REFRESH_MS, enabled = true }: { intervalMs?: number; enabled?: boolean } = {},
) {
  const refreshRef = React.useRef(refresh);
  React.useEffect(() => {
    refreshRef.current = refresh;
  }, [refresh]);

  React.useEffect(() => {
    if (!enabled) return;

    let inFlight = false;
    async function tick() {
      if (inFlight || document.visibilityState !== "visible") return;
      inFlight = true;
      try {
        await refreshRef.current();
      } finally {
        inFlight = false;
      }
    }

    const timer = setInterval(() => void tick(), intervalMs);
    const onReturn = () => void tick();
    document.addEventListener("visibilitychange", onReturn);
    window.addEventListener("focus", onReturn);
    window.addEventListener("pageshow", onReturn);
    window.addEventListener("online", onReturn);

    return () => {
      clearInterval(timer);
      document.removeEventListener("visibilitychange", onReturn);
      window.removeEventListener("focus", onReturn);
      window.removeEventListener("pageshow", onReturn);
      window.removeEventListener("online", onReturn);
    };
  }, [intervalMs, enabled]);
}
