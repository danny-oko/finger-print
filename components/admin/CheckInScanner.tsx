"use client";

import {
  Camera,
  CloudOff,
  Flashlight,
  ListChecks,
  LogOut,
  ScanLine,
  Search,
  Table2,
  TriangleAlert,
} from "lucide-react";
import { useRouter } from "next/navigation";
import * as React from "react";
import { toast } from "sonner";

import { DoorSearch } from "@/components/admin/DoorSearch";
import { RecentCheckIns } from "@/components/admin/RecentCheckIns";
import { ScanOutcomeCard, toneOf, type DoorResult } from "@/components/admin/ScanOutcomeCard";
import { useMediaQuery } from "@/hooks/use-media-query";
import { useOfflineScans, type PendingScan } from "@/hooks/use-offline-scans";
import { useQrScanner } from "@/hooks/use-qr-scanner";
import {
  checkInAttendee,
  loadDoorState,
  scanTicket,
  undoCheckIn,
} from "@/lib/admin/actions";
import {
  OUTCOME_TITLE,
  type CheckInAttendee,
  type CheckInResponse,
  type DoorCounts,
  type DoorSearchHit,
  type OutcomeTone,
} from "@/lib/admin/checkIn";
import { armScanSound, playScanFeedback } from "@/lib/admin/scanFeedback";
import { cn } from "@/lib/utils";

// A ticket lingers in front of the lens long after it has been read. Holding
// the last code down for a few seconds is what stops one person walking in
// and generating a screenful of "already checked in".
const SAME_CODE_COOLDOWN_MS = 6000;
const SUCCESS_CLEAR_MS = 2500;
const REFRESH_MS = 30_000;
const RECENT_LIMIT = 25;

type Tab = "scan" | "search" | "recent";

// Phones get one section at a time behind the bottom tabs. From a tablet up
// the camera stays on screen with search / recent beside it, or below it
// when the screen is upright.
const WIDE_QUERY = "(min-width: 768px)";
const WIDTH = "max-w-lg md:max-w-6xl";

const FLASH: Record<OutcomeTone, string> = {
  success: "ring-emerald-400",
  warning: "ring-amber-400",
  danger: "ring-red-500",
};

export function CheckInScanner({ unprotected = false }: { unprotected?: boolean }) {
  const router = useRouter();

  const wide = useMediaQuery(WIDE_QUERY);
  const [tab, setTab] = React.useState<Tab>("scan");
  const [counts, setCounts] = React.useState<DoorCounts>({ expected: 0, checkedIn: 0 });
  const [recent, setRecent] = React.useState<CheckInAttendee[]>([]);
  const [result, setResult] = React.useState<DoorResult | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [busy, setBusy] = React.useState(false);
  const [undoingId, setUndoingId] = React.useState<string | null>(null);
  const [checkingId, setCheckingId] = React.useState<string | null>(null);
  // Offline scans that came back as a problem once the network returned.
  const [flagged, setFlagged] = React.useState<{ scan: PendingScan; title: string }[]>([]);

  const busyRef = React.useRef(false);
  const lastCode = React.useRef<{ text: string; at: number } | null>(null);

  const remember = React.useCallback((attendee: CheckInAttendee) => {
    setRecent((rows) =>
      [attendee, ...rows.filter((row) => row.attendeeId !== attendee.attendeeId)].slice(0, RECENT_LIMIT),
    );
  }, []);

  const apply = React.useCallback(
    (data: CheckInResponse) => {
      setResult(data.result);
      if (data.counts) setCounts(data.counts);
      if (data.result.outcome === "checked_in") remember(data.result.attendee);
      playScanFeedback(toneOf(data.result));
    },
    [remember],
  );

  const { pending, enqueue, flush } = useOfflineScans(
    React.useCallback(
      (data: CheckInResponse, scan: PendingScan) => {
        if (data.counts) setCounts(data.counts);
        if (data.result.outcome === "checked_in") {
          remember(data.result.attendee);
          return;
        }
        if (data.result.outcome === "already") return;
        setFlagged((list) => [...list, { scan, title: OUTCOME_TITLE[data.result.outcome] }]);
        playScanFeedback("danger");
      },
      [remember],
    ),
  );

  const submit = React.useCallback(
    async (text: string) => {
      if (busyRef.current) return;
      busyRef.current = true;
      setBusy(true);

      try {
        const response = await scanTicket(text);

        if (!response.ok) {
          if (response.offline) {
            enqueue(text.trim().toUpperCase());
            setResult({ outcome: "offline", code: text.trim().toUpperCase() });
            playScanFeedback("warning");
            return;
          }
          setError(response.message);
          playScanFeedback("danger");
          return;
        }

        setError(null);
        apply(response.data);
      } finally {
        // Restamped on the answer, not on the read, so the cooldown covers
        // the time the staff spends looking at the result.
        if (lastCode.current) lastCode.current.at = Date.now();
        busyRef.current = false;
        setBusy(false);
      }
    },
    [apply, enqueue],
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

  const { videoRef, status, insecure, retry, mirrored, torchAvailable, torchOn, toggleTorch } = useQrScanner({
    onDecode: handleDecode,
    // The camera stays warm on the other tabs; it just stops reading.
    paused: busy || (!wide && tab !== "scan") || (result !== null && toneOf(result) !== "success"),
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
    // eslint-disable-next-line react-hooks/set-state-in-effect -- async load, nothing set synchronously
    void refresh();
    const timer = setInterval(() => {
      if (document.visibilityState === "visible") void refresh();
    }, REFRESH_MS);

    // Coming back to this screen (another tab, the monitor, the browser's
    // back button) means someone may have changed the list meanwhile.
    function onReturn() {
      if (document.visibilityState === "visible") void refresh();
    }
    document.addEventListener("visibilitychange", onReturn);
    window.addEventListener("pageshow", onReturn);

    return () => {
      clearInterval(timer);
      document.removeEventListener("visibilitychange", onReturn);
      window.removeEventListener("pageshow", onReturn);
    };
  }, [refresh]);

  // Green clears itself back to the viewfinder; anything that needs a
  // decision stays until someone taps "next".
  React.useEffect(() => {
    if (!result || toneOf(result) !== "success") return;
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
      current && "attendee" in current && current.attendee.attendeeId === attendee.attendeeId ? null : current,
    );
    // Let the same ticket be scanned again straight away.
    lastCode.current = null;
    toast.success(`${attendee.fullName} — ирсэн бүртгэл цуцлагдлаа`);
  }

  async function handleManualCheckIn(hit: DoorSearchHit) {
    setCheckingId(hit.attendeeId);
    const response = await checkInAttendee(hit.attendeeId);
    setCheckingId(null);

    if (!response.ok) {
      toast.error(response.message);
      return;
    }
    apply(response.data);
    setTab("scan");
  }

  function handleCode(code: string) {
    lastCode.current = { text: code, at: Date.now() };
    setTab("scan");
    void submit(code);
  }

  async function handleSignOut() {
    await fetch("/api/admin/session", { method: "DELETE" }).catch(() => {});
    router.refresh();
  }

  const remaining = Math.max(counts.expected - counts.checkedIn, 0);
  const progress = counts.expected > 0 ? (counts.checkedIn / counts.expected) * 100 : 0;
  const tone = result ? toneOf(result) : null;
  const panel = tab === "recent" ? "recent" : "search";

  return (
    <main className="event-ui flex h-dvh flex-col bg-neutral-950 text-white">
      <header className="shrink-0 border-b border-white/10 pt-3 pb-3">
        <div className={cn("mx-auto flex w-full items-center gap-1 px-4", WIDTH)}>
          <div className="min-w-0 flex-1">
            <p className="text-2xl leading-none font-black tabular-nums">
              {counts.checkedIn}
              <span className="text-base font-semibold text-white/40"> / {counts.expected} ирсэн</span>
            </p>
            <p className="mt-1 text-xs text-white/50">{remaining} хүн ирээгүй байна</p>
          </div>

          {torchAvailable && (wide || tab === "scan") && (
            <button
              type="button"
              onClick={() => void toggleTorch()}
              aria-pressed={torchOn}
              aria-label="Гэрэл"
              className={cn(
                "grid size-11 place-items-center rounded-full text-white/70 hover:bg-white/10",
                torchOn && "bg-white/15 text-brand",
              )}
            >
              <Flashlight className="size-5" />
            </button>
          )}
          <a
            href="/admin/registration-monitor"
            aria-label="Бүртгэлийн хяналт"
            className="grid size-11 place-items-center rounded-full text-white/70 hover:bg-white/10"
          >
            <Table2 className="size-5" />
          </a>
          {!unprotected && (
            <button
              type="button"
              onClick={handleSignOut}
              aria-label="Гарах"
              className="grid size-11 place-items-center rounded-full text-white/70 hover:bg-white/10"
            >
              <LogOut className="size-5" />
            </button>
          )}
        </div>
        <div className={cn("mx-auto mt-2.5 w-full px-4", WIDTH)}>
          <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
            <div className="h-full rounded-full bg-brand transition-[width] duration-500" style={{ width: `${progress}%` }} />
          </div>
        </div>
      </header>

      {(pending.length > 0 || flagged.length > 0 || error) && (
        <div className={cn("mx-auto grid w-full shrink-0 gap-2 px-4 pt-3", WIDTH)}>
          {pending.length > 0 && (
            <button
              type="button"
              onClick={() => void flush()}
              className="flex items-center gap-2 rounded-xl bg-amber-400/15 px-4 py-2.5 text-left text-sm text-amber-100"
            >
              <CloudOff className="size-4 shrink-0" />
              Сүлжээгүй үед уншуулсан {pending.length} тасалбар хүлээгдэж байна. Дарж дахин оролдох.
            </button>
          )}
          {flagged.map(({ scan, title }) => (
            <div key={scan.code + scan.scannedAt} className="flex items-start gap-2 rounded-xl bg-red-500/20 px-4 py-2.5 text-sm text-red-100">
              <TriangleAlert className="mt-0.5 size-4 shrink-0" />
              <span className="flex-1">
                <span className="font-mono">{scan.code}</span> — {title}. Сүлжээгүй үед оруулсан хүнийг шалгана уу.
              </span>
              <button
                type="button"
                onClick={() => setFlagged((list) => list.filter((f) => f.scan !== scan))}
                className="font-semibold underline"
              >
                Ойлголоо
              </button>
            </div>
          ))}
          {error && (
            <div className="flex items-start gap-2 rounded-xl bg-red-500/20 px-4 py-2.5 text-sm text-red-100">
              <TriangleAlert className="mt-0.5 size-4 shrink-0" />
              <span className="flex-1">{error}</span>
              <button type="button" onClick={() => window.location.reload()} className="font-semibold underline">
                Шинэчлэх
              </button>
            </div>
          )}
        </div>
      )}

      <div
        className={cn(
          "mx-auto flex min-h-0 w-full flex-1 flex-col px-4 pt-3 pb-3",
          "md:grid md:grid-rows-[minmax(0,3fr)_minmax(0,2fr)] md:gap-4 md:pb-4",
          "md:landscape:grid-cols-[minmax(0,1fr)_340px] md:landscape:grid-rows-[minmax(0,1fr)]",
          "lg:landscape:grid-cols-[minmax(0,1fr)_400px] lg:landscape:gap-6",
          WIDTH,
        )}
      >
        <div className={cn("relative min-h-0 flex-1", tab !== "scan" && "hidden md:block")}>
          <div
            className={cn(
              "absolute inset-0 overflow-hidden rounded-3xl bg-black ring-4 ring-transparent transition-shadow [container-type:size]",
              tone && FLASH[tone],
            )}
          >
            <video
              ref={videoRef}
              playsInline
              muted
              autoPlay
              className={cn(
                "size-full object-cover transition-opacity",
                mirrored && "-scale-x-100",
                status === "live" ? "opacity-100" : "opacity-0",
              )}
            />

            {status === "live" && !result && (
              <>
                <div className="pointer-events-none absolute top-1/2 left-1/2 size-[min(62cqw,62cqh)] -translate-x-1/2 -translate-y-1/2 rounded-3xl border-[3px] border-white/70" />
                <p className="pointer-events-none absolute inset-x-0 bottom-4 text-center text-sm font-medium text-white/80">
                  {busy ? "Шалгаж байна…" : "QR-г хүрээн дотор барина уу"}
                </p>
              </>
            )}

            {status !== "live" && (
              <div className="absolute inset-0 grid content-center justify-items-center gap-3 px-6 text-center">
                {status === "starting" ? (
                  <>
                    <ScanLine className="size-8 animate-pulse text-white/50" />
                    <p className="text-sm text-white/60">Камер асааж байна…</p>
                  </>
                ) : (
                  <>
                    <Camera className="size-8 text-white/40" />
                    <p className="font-semibold">
                      {status === "denied" ? "Камерын зөвшөөрөл өгөөгүй байна" : "Камер нээгдсэнгүй"}
                    </p>
                    <p className="text-sm leading-relaxed text-white/60">
                      {insecure
                        ? "Хаяг https:// байх шаардлагатай."
                        : status === "denied"
                          ? "Хөтчийн тохиргооноос энэ сайтад камерын зөвшөөрөл өгөөд дахин оролдоно уу."
                          : "Өөр програм камерыг ашиглаж байгаа эсэхийг шалгана уу."}
                    </p>
                    <div className="mt-1 flex flex-wrap justify-center gap-2">
                      <button type="button" onClick={retry} className="h-11 rounded-full bg-white px-5 text-sm font-semibold text-neutral-950">
                        Дахин оролдох
                      </button>
                      <button
                        type="button"
                        onClick={() => setTab("search")}
                        className="h-11 rounded-full border border-white/25 px-5 text-sm font-semibold"
                      >
                        Нэр, кодоор хайх
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          {result && (
            <div className="absolute inset-x-0 bottom-0 p-2 md:mx-auto md:max-w-md md:p-4">
              <ScanOutcomeCard
                result={result}
                undoing={"attendee" in result && undoingId === result.attendee.attendeeId}
                onUndo={"attendee" in result ? () => void handleUndo(result.attendee) : undefined}
                onDismiss={() => setResult(null)}
              />
            </div>
          )}
        </div>

        {(wide || tab !== "scan") && (
          <section className="flex min-h-0 flex-1 flex-col gap-3 md:rounded-3xl md:border md:border-white/10 md:bg-white/[0.03] md:p-4">
            {wide && (
              <div className="grid shrink-0 grid-cols-2 gap-1 rounded-full bg-white/5 p-1" role="tablist">
                {(
                  [
                    { id: "search", label: "Хайх" },
                    { id: "recent", label: "Сүүлд орсон" },
                  ] as const
                ).map(({ id, label }) => (
                  <button
                    key={id}
                    type="button"
                    role="tab"
                    aria-selected={panel === id}
                    onClick={() => setTab(id)}
                    className={cn(
                      "h-10 rounded-full text-sm font-semibold transition-colors",
                      panel === id ? "bg-white/15 text-white" : "text-white/50 hover:text-white/80",
                    )}
                  >
                    {label}
                  </button>
                ))}
              </div>
            )}

            <div className="min-h-0 flex-1 overflow-y-auto">
              {panel === "recent" ? (
                <RecentCheckIns rows={recent} onUndo={handleUndo} undoingId={undoingId} />
              ) : (
                <DoorSearch
                  onCheckIn={handleManualCheckIn}
                  onCode={handleCode}
                  busyId={checkingId}
                  autoFocus={!wide}
                />
              )}
            </div>
          </section>
        )}
      </div>

      <nav className="shrink-0 border-t border-white/10 pb-[env(safe-area-inset-bottom)] md:hidden" aria-label="Хэсгүүд">
        <div className="mx-auto grid w-full max-w-lg grid-cols-3">
          {(
            [
              { id: "scan", label: "Уншуулах", Icon: ScanLine },
              { id: "search", label: "Хайх", Icon: Search },
              { id: "recent", label: "Сүүлд орсон", Icon: ListChecks },
            ] as const
          ).map(({ id, label, Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => setTab(id)}
              aria-current={tab === id ? "page" : undefined}
              className={cn(
                "flex h-16 flex-col items-center justify-center gap-1 text-xs font-semibold transition-colors",
                tab === id ? "text-white" : "text-white/45 hover:text-white/70",
              )}
            >
              <Icon className="size-5" />
              {label}
            </button>
          ))}
        </div>
      </nav>
    </main>
  );
}
