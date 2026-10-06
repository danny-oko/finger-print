"use client";

import * as React from "react";

import type { RegistrationBootstrap } from "@/lib/registration/bootstrap";

export function useRegistrationBootstrap() {
  const [data, setData] = React.useState<RegistrationBootstrap | null>(null);

  const load = React.useCallback(async () => {
    try {
      const res = await fetch("/api/registration/bootstrap");
      if (res.ok) setData(await res.json());
    } catch {
      // The form still works: prices come back with the review, and the
      // server enforces every rule on submit.
    }
  }, []);

  React.useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- async fetch, no sync setState
    void load();
    const onVisible = () => {
      if (document.visibilityState === "visible") void load();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, [load]);

  const addChurch = React.useCallback((name: string) => {
    setData((prev) =>
      prev && !prev.churches.some((c) => c.toLowerCase() === name.toLowerCase())
        ? { ...prev, churches: [...prev.churches, name].sort((a, b) => a.localeCompare(b, "mn")) }
        : prev,
    );
    void fetch("/api/registration/churches", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    }).catch(() => {});
  }, []);

  return { data, reload: load, addChurch };
}
