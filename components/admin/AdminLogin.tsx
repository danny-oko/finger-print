"use client";

import { Loader2, Lock } from "lucide-react";
import { useRouter } from "next/navigation";
import * as React from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export function AdminLogin() {
  const router = useRouter();
  const [password, setPassword] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!password) return;

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/admin/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      if (res.ok) {
        setPassword("");
        router.refresh();
        return;
      }

      const data = await res.json().catch(() => ({}));
      setError(
        data.error === "not_configured"
          ? "Админ нэвтрэлт тохируулагдаагүй байна (ADMIN_PASSWORD)."
          : "Нууц үг буруу байна.",
      );
    } catch {
      setError("Нэвтрэхэд алдаа гарлаа. Дахин оролдоно уу.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="flex min-h-dvh items-center justify-center bg-neutral-50 px-4 py-10">
      <Card className="w-full max-w-sm border-neutral-200 shadow-sm">
        <CardContent className="grid gap-5">
          <div className="grid justify-items-center gap-2 text-center">
            <div className="flex size-11 items-center justify-center rounded-full bg-[#FFF7EC]">
              <Lock className="size-5 text-[#F98C01]" />
            </div>
            <h1 className="text-lg font-black text-neutral-900">
              Бүртгэлийн хяналт
            </h1>
            <p className="text-sm text-muted-foreground">
              Үргэлжлүүлэхийн тулд админ нууц үгээ оруулна уу.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="grid gap-3">
            <Input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Админ нууц үг"
              autoComplete="current-password"
              autoFocus
              className="h-11"
            />

            {error && <p className="text-sm text-destructive">{error}</p>}

            <Button type="submit" size="lg" disabled={!password || submitting}>
              {submitting ? <Loader2 className="size-4 animate-spin" /> : null}
              Нэвтрэх
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
