"use client";

import { Loader2, Lock } from "lucide-react";
import { useRouter } from "next/navigation";
import * as React from "react";

import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

// The code is short and typed by the same few organisers all weekend, so
// there's no button to press: it submits itself once typing stops. The pause
// is what keeps a 2-digit code from firing a request after the first digit.
const SUBMIT_DELAY_MS = 450;

export function AdminLogin() {
  const router = useRouter();
  const [code, setCode] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const attempt = React.useCallback(
    async (candidate: string) => {
      setSubmitting(true);
      setError(null);

      try {
        const res = await fetch("/api/admin/session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ password: candidate }),
        });

        if (res.ok) {
          router.refresh();
          return;
        }

        const data = await res.json().catch(() => ({}));
        setError(
          data.error === "not_configured"
            ? "Админ нэвтрэлт тохируулагдаагүй байна (ADMIN_PASSWORD)."
            : "Код буруу байна.",
        );
        // Clear so the next attempt starts fresh — and so the effect below
        // doesn't immediately retry the code that just failed.
        setCode("");
        inputRef.current?.focus();
      } catch {
        setError("Нэвтрэхэд алдаа гарлаа. Дахин оролдоно уу.");
        setCode("");
      } finally {
        setSubmitting(false);
      }
    },
    [router],
  );

  React.useEffect(() => {
    if (!code || submitting) return;
    const timer = setTimeout(() => void attempt(code), SUBMIT_DELAY_MS);
    return () => clearTimeout(timer);
  }, [code, submitting, attempt]);

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
              Кодоо оруулмагц автоматаар нэвтэрнэ.
            </p>
          </div>

          <form
            onSubmit={(event) => {
              event.preventDefault();
              if (code && !submitting) void attempt(code);
            }}
            className="grid gap-3"
          >
            <div className="relative">
              <Input
                ref={inputRef}
                // `one-time-code` is what stops password managers offering to
                // save this as an account and asking for a username to go
                // with it — there is no account here, just a code.
                autoComplete="one-time-code"
                name="code"
                type="password"
                inputMode="numeric"
                value={code}
                onChange={(event) => setCode(event.target.value.trim())}
                placeholder="Код"
                aria-label="Админ код"
                aria-busy={submitting}
                autoFocus
                readOnly={submitting}
                className="h-12 text-center text-lg tracking-[0.4em]"
              />
              {submitting && (
                <Loader2 className="absolute right-3 top-1/2 size-4 -translate-y-1/2 animate-spin text-muted-foreground" />
              )}
            </div>

            <p role="alert" className="min-h-5 text-center text-sm text-destructive">
              {error}
            </p>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
