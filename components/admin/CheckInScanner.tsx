"use client";

import {
  Camera,
  Flashlight,
  Keyboard,
  ListChecks,
  LogOut,
  ScanLine,
  Table2,
  TriangleAlert,
} from "lucide-react";
import { useRouter } from "next/navigation";
import * as React from "react";
import { toast } from "sonner";

import { RecentCheckIns } from "@/components/admin/RecentCheckIns";
import { ScanOutcomeCard } from "@/components/admin/ScanOutcomeCard";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useQrScanner } from "@/hooks/use-qr-scanner";
import { loadDoorState, scanTicket, undoCheckIn } from "@/lib/admin/actions";
import {
  OUTCOME_TONE,
  parseTicketCode,
  type CheckInAttendee,
  type CheckInResult,
  type DoorCounts,
  type OutcomeTone,
} from "@/lib/admin/checkIn";
import { armScanSound, playScanFeedback } from "@/lib/admin/scanFeedback";
import { cn } from "@/lib/utils";

// A ticket lingers in front of the lens long after it has been read. Holding
// the last code down for a few seconds is what stops one person walking in
// and generating a screenful of "already checked in".
const SAME_CODE_COOLDOWN_MS = 6000;

const FLASH_MS = 450;
const SUCCESS_CLEAR_MS = 5000;
const REFRESH_MS = 45_000;
const RECENT_LIMIT = 25;

const FLASH_CLASS: Record<OutcomeTone, string> = {
  success: "bg-emerald-400/30",
  warning: "bg-amber-400/30",
  danger: "bg-red-500/30",
};

export function CheckInScanner({ unprotected = false }: { unprotected?: boolean }) {
  const router = useRouter();

  const [counts, setCounts] = React.useState<DoorCounts>({ expected: 0, checkedIn: 0 });
  const [recent, setRecent] = React.useState<CheckInAttendee[]>([]);
  const [result, setResult] = React.useState<CheckInResult | null>(null);
  const [flash, setFlash] = React.useState<OutcomeTone | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [busy, setBusy] = React.useState(false);
  const [undoingId, setUndoingId] = React.useState<string | null>(null);
  const [manualOpen, setManualOpen] = React.useState(false);
  const [manualCode, setManualCode] = React.useState("");

  const busyRef = React.useRef(false);
  const lastCode = React.useRef<{ text: string; at: number } | null>(null);

  const pulse = React.useCallback((tone: OutcomeTone) => {
    setFlash(tone);
    window.setTimeout(() => setFlash((current) => (current === tone ? null : current)), FLASH_MS);
  }, []);

  const submit = React.useCallback(
    async (text: string) => {
      if (busyRef.current) return;
      busyRef.current = true;
      setBusy(true);

      try {
        const response = await scanTicket(text);

        if (!response.ok) {
          setError(response.message);
          playScanFeedback("danger");
          pulse("danger");
          return;
        }

        setError(null);
        setResult(response.data.result);
        setCounts(response.data.counts);

        const tone = OUTCOME_TONE[response.data.result.outcome];
        playScanFeedback(tone);
        pulse(tone);

        if (response.data.result.outcome === "checked_in") {
          const { attendee } = response.data.result;
          setRecent((rows) =>
            [attendee, ...rows.filter((row) => row.attendeeId !== attendee.attendeeId)].slice(
              0,
              RECENT_LIMIT,
            ),
          );
        }
      } finally {
        // Restamped on the answer, not on the read, so the cooldown covers
        // the time the staff spends looking at the result.
        if (lastCode.current) lastCode.current.at = Date.now();
        busyRef.current = false;
        setBusy(false);
      }
    },
    [pulse],
  );

  const handleDecode = React.useCallback(
    (text: string) => {
      const last = lastCode.current;
      if (last && last.text === text && Date.now() - last.at < SAME_CODE_COOLDOWN_MS) return;

      lastCode.current = { text, at: Date.now() };
      void submit(text);
    },
    [submit],
  );

  const { videoRef, status, insecure, retry, torchAvailable, torchOn, toggleTorch } =
    useQrScanner({
      onDecode: handleDecode,
      paused: busy || manualOpen,
    });

  React.useEffect(() => {
    window.addEventListener("pointerdown", armScanSound, { once: true });
    return () => window.removeEventListener("pointerdown", armScanSound);
  }, []);

  const refresh = React.useCallback(async () => {
    const response = await loadDoorState();
    if (!response.ok) return;
    setCounts(response.data.counts);
    setRecent(response.data.recent);
  }, []);

  React.useEffect(() => {
    // Loads asynchronously, so nothing is set during the effect itself — but
    // the door does need its counts on open rather than a refresh later.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void refresh();
    const timer = setInterval(() => void refresh(), REFRESH_MS);
    return () => clearInterval(timer);
  }, [refresh]);

  // A green card that never leaves looks the same as a green card for the
  // person still standing there, so success clears itself back to the
  // viewfinder. Anything that needs a decision stays put.
  React.useEffect(() => {
    if (result?.outcome !== "checked_in") return;
    const timer = setTimeout(() => setResult(null), SUCCESS_CLEAR_MS);
    return () => clearTimeout(timer);
  }, [result]);

  async function handleUndo(attendee: CheckInAttendee) {
    setUndoingId(attendee.attendeeId);
    const response = await undoCheckIn(attendee.attendeeId);
    setUndoingId(null);

    if (!response.ok) {
      toast.error(response.message);
      return;
    }

    setCounts(response.data.counts);
    setRecent((rows) => rows.filter((row) => row.attendeeId !== attendee.attendeeId));
    setResult((current) =>
      current && "attendee" in current && current.attendee.attendeeId === attendee.attendeeId
        ? null
        : current,
    );
    // Let the same ticket be scanned again immediately rather than waiting
    // out a cooldown for a check-in that no longer exists.
    lastCode.current = null;
    toast.success(`${attendee.fullName} — ирсэн бүртгэл цуцлагдлаа`);
  }

  function handleManualSubmit() {
    const code = parseTicketCode(manualCode);
    if (!code) return;

    setManualOpen(false);
    setManualCode("");
    lastCode.current = { text: code, at: Date.now() };
    void submit(code);
  }

  async function handleSignOut() {
    await fetch("/api/admin/session", { method: "DELETE" }).catch(() => {});
    router.refresh();
  }

  const remaining = Math.max(counts.expected - counts.checkedIn, 0);
  const progress = counts.expected > 0 ? (counts.checkedIn / counts.expected) * 100 : 0;
  const manualValid = parseTicketCode(manualCode) !== null;

  return (
    <main className="min-h-dvh bg-neutral-950 pb-10 text-white">
      <header className="sticky top-0 z-20 border-b border-white/10 bg-neutral-950/95 backdrop-blur">
        <div className="mx-auto flex w-full max-w-lg items-center gap-2 px-4 py-3">
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-base font-black">Хаалганы бүртгэл</h1>
            <p className="truncate text-[11px] text-white/50">
              QR-г камерт харуулмагц бүртгэгдэнэ
            </p>
          </div>

          {torchAvailable && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => void toggleTorch()}
              aria-pressed={torchOn}
              aria-label="Гэрэл"
              title="Гэрэл"
              className={cn(
                "text-white/70 hover:bg-white/10 hover:text-white",
                torchOn && "bg-white/15 text-[#F98C01]",
              )}
            >
              <Flashlight className="size-4" />
            </Button>
          )}

          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => setManualOpen(true)}
            aria-label="Кодыг гараар оруулах"
            title="Кодыг гараар оруулах"
            className="text-white/70 hover:bg-white/10 hover:text-white"
          >
            <Keyboard className="size-4" />
          </Button>

          <Button
            asChild
            variant="ghost"
            size="icon"
            aria-label="Бүртгэлийн хяналт"
            title="Бүртгэлийн хяналт"
            className="text-white/70 hover:bg-white/10 hover:text-white"
          >
            <a href="/admin/registration-monitor">
              <Table2 className="size-4" />
            </a>
          </Button>

          {!unprotected && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={handleSignOut}
              aria-label="Гарах"
              title="Гарах"
              className="text-white/70 hover:bg-white/10 hover:text-white"
            >
              <LogOut className="size-4" />
            </Button>
          )}
        </div>

        <div className="mx-auto w-full max-w-lg px-4 pb-3">
          <div className="flex items-end justify-between gap-3">
            <p className="text-2xl font-black tabular-nums">
              {counts.checkedIn}
              <span className="text-base font-bold text-white/40"> / {counts.expected}</span>
            </p>
            <p className="pb-1 text-xs text-white/50">{remaining} хүн хүлээгдэж байна</p>
          </div>
          <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-[#F98C01] transition-[width] duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </header>

      <div className="mx-auto grid w-full max-w-lg gap-4 px-4 pt-4">
        <div className="relative aspect-square overflow-hidden rounded-2xl border border-white/10 bg-black">
          <video
            ref={videoRef}
            playsInline
            muted
            autoPlay
            className={cn(
              "size-full object-cover transition-opacity",
              status === "live" ? "opacity-100" : "opacity-0",
            )}
          />

          {status === "live" && (
            <>
              <div className="pointer-events-none absolute inset-[15%] rounded-2xl border-2 border-white/40" />
              <p className="pointer-events-none absolute inset-x-0 bottom-3 text-center text-xs font-medium text-white/70">
                {busy ? "Шалгаж байна..." : "QR-г хүрээн дотор барина уу"}
              </p>
            </>
          )}

          {flash && (
            <div
              className={cn(
                "pointer-events-none absolute inset-0 animate-pulse",
                FLASH_CLASS[flash],
              )}
            />
          )}

          {status !== "live" && (
            <div className="absolute inset-0 grid content-center justify-items-center gap-3 px-6 text-center">
              {status === "starting" ? (
                <>
                  <ScanLine className="size-8 animate-pulse text-white/50" />
                  <p className="text-sm text-white/60">Камер асааж байна...</p>
                </>
              ) : (
                <>
                  <Camera className="size-8 text-white/40" />
                  <p className="text-sm font-semibold text-white">
                    {status === "denied"
                      ? "Камер ашиглах зөвшөөрөл өгөөгүй байна"
                      : "Камер нээгдсэнгүй"}
                  </p>
                  <p className="text-xs leading-relaxed text-white/50">
                    {insecure
                      ? "Хаяг https:// байх шаардлагатай. Хаягаа шалгаад дахин оролдоно уу."
                      : status === "denied"
                        ? "Хөтчийн тохиргооноос энэ сайтад камерын зөвшөөрөл өгөөд дахин оролдоно уу."
                        : "Өөр програм камерыг ашиглаж байгаа эсэхийг шалгана уу."}
                  </p>
                  <div className="mt-1 flex flex-wrap justify-center gap-2">
                    <Button type="button" size="sm" onClick={retry}>
                      Дахин оролдох
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => setManualOpen(true)}
                      className="border-white/20 bg-transparent text-white hover:bg-white/10 hover:text-white"
                    >
                      Кодыг гараар оруулах
                    </Button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {error && (
          <div className="flex items-start gap-2 rounded-xl border border-red-400/40 bg-red-500/15 p-3">
            <TriangleAlert className="mt-0.5 size-4 shrink-0 text-red-300" />
            <div className="min-w-0 flex-1">
              <p className="text-sm text-red-100">{error}</p>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => window.location.reload()}
                className="mt-2 border-white/20 bg-transparent text-white hover:bg-white/10 hover:text-white"
              >
                Хуудсыг шинэчлэх
              </Button>
            </div>
          </div>
        )}

        {result ? (
          <ScanOutcomeCard
            result={result}
            undoing={"attendee" in result && undoingId === result.attendee.attendeeId}
            onUndo={
              "attendee" in result ? () => void handleUndo(result.attendee) : undefined
            }
          />
        ) : (
          <p className="rounded-2xl border border-dashed border-white/15 py-6 text-center text-sm text-white/40">
            Дараагийн хүний QR-г уншуулна уу.
          </p>
        )}

        <section className="grid gap-2">
          <h2 className="flex items-center gap-1.5 text-xs font-semibold tracking-wider text-white/40 uppercase">
            <ListChecks className="size-3.5" />
            Сүүлд орсон
          </h2>
          <RecentCheckIns rows={recent} onUndo={handleUndo} undoingId={undoingId} />
        </section>
      </div>

      <Dialog open={manualOpen} onOpenChange={setManualOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Кодыг гараар оруулах</DialogTitle>
            <DialogDescription>
              Тасалбар дээрх кодыг бичнэ үү. Зураас, том жижиг үсэг хамаагүй.
            </DialogDescription>
          </DialogHeader>

          <Input
            value={manualCode}
            onChange={(event) => setManualCode(event.target.value.toUpperCase())}
            onKeyDown={(event) => {
              if (event.key === "Enter" && manualValid) handleManualSubmit();
            }}
            placeholder="FP-XXXX-XXXX"
            aria-label="Тасалбарын код"
            autoFocus
            autoCapitalize="characters"
            autoCorrect="off"
            spellCheck={false}
            className="h-12 text-center font-mono text-lg tracking-widest"
          />

          <DialogFooter>
            <Button type="button" onClick={handleManualSubmit} disabled={!manualValid}>
              Бүртгэх
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
}
