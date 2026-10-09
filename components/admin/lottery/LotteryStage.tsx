"use client";

import { LogOut, RefreshCw, Table2, X } from "lucide-react";
import { MotionConfig, motion } from "motion/react";
import { useRouter } from "next/navigation";
import * as React from "react";
import { toast } from "sonner";

import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { Confetti } from "@/components/admin/lottery/Confetti";
import {
  LotteryReels,
  useReels,
} from "@/components/admin/lottery/LotteryReels";
import { useLiveRefresh } from "@/hooks/use-live-refresh";
import {
  drawLottery,
  loadLottery,
  MANAGE_MESSAGE,
  removeLotteryWinner,
} from "@/lib/admin/actions";
import type { LotteryState, LotteryWinner } from "@/lib/lottery/types";
import { cn } from "@/lib/utils";

const UB_TIME = new Intl.DateTimeFormat("en-GB", {
  timeZone: "Asia/Ulaanbaatar",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

function formatTime(iso: string) {
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? "" : UB_TIME.format(date);
}

type Phase = "idle" | "drawing" | "revealed";

export function LotteryStage({
  unprotected = false,
}: {
  unprotected?: boolean;
}) {
  const router = useRouter();
  const reels = useReels();

  const [state, setState] = React.useState<LotteryState | null>(null);
  const [loadError, setLoadError] = React.useState<string | null>(null);
  const [phase, setPhase] = React.useState<Phase>("idle");
  const [winner, setWinner] = React.useState<LotteryWinner | null>(null);
  const [removing, setRemoving] = React.useState<LotteryWinner | null>(null);
  const [working, setWorking] = React.useState(false);

  const phaseRef = React.useRef(phase);
  React.useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);

  const refresh = React.useCallback(async () => {
    const result = await loadLottery();
    if (!result.ok) {
      if (result.message === MANAGE_MESSAGE.unauthorized) router.refresh();
      setLoadError(result.message);
      return;
    }
    setLoadError(null);
    // Another screen may have drawn meanwhile; the list catches up, the
    // stage keeps whatever it is showing.
    setState(result.data);
  }, [router]);

  React.useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- refresh() sets state only after its fetch resolves
    void refresh();
  }, [refresh]);

  useLiveRefresh(refresh, { enabled: phase !== "drawing" });

  const pool = state?.pool ?? 0;
  const canDraw = state !== null && pool > 0 && phase !== "drawing";

  const draw = React.useCallback(async () => {
    if (phaseRef.current === "drawing") return;

    phaseRef.current = "drawing";
    setPhase("drawing");
    setWinner(null);
    reels.spin();

    const result = await drawLottery();

    if (!result.ok) {
      reels.stop();
      reels.show(null);
      setPhase("idle");
      toast.error(result.message);
      void refresh();
      return;
    }

    await reels.land(result.data.winner.ticketCode);
    setWinner(result.data.winner);
    setState(result.data.state);
    setPhase("revealed");
  }, [reels, refresh]);

  // A presenter at a laptop draws with the space bar.
  React.useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key !== " " && event.key !== "Enter") return;
      const target = event.target as HTMLElement | null;
      if (
        target?.closest(
          "input, textarea, button, [role='dialog'], [role='alertdialog']"
        )
      )
        return;
      if (!canDraw) return;
      event.preventDefault();
      void draw();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [canDraw, draw]);

  async function confirmRemove() {
    if (!removing) return;
    setWorking(true);
    const result = await removeLotteryWinner(removing.id);
    setWorking(false);

    if (!result.ok) {
      toast.error(result.message);
    } else {
      setState(result.data);
      toast.success(`${removing.fullName} жагсаалтаас хасагдлаа`);
      if (winner?.id === removing.id) {
        setWinner(null);
        reels.show(null);
        setPhase("idle");
      }
    }
    setRemoving(null);
  }

  async function handleSignOut() {
    await fetch("/api/admin/session", { method: "DELETE" }).catch(() => {});
    router.refresh();
  }

  const winners = state?.winners ?? [];

  return (
    // A projected show the presenter starts on purpose. Windows reports
    // "reduce motion" whenever its animation effects are off, which would
    // otherwise skip the spin and confetti entirely.
    <MotionConfig reducedMotion="never">
      <main className="event-ui min-h-dvh bg-neutral-950 text-white">
        <Confetti fireKey={phase === "revealed" ? (winner?.id ?? null) : null} />
        {/* The stage fills the screen on its own, so the list growing below it
            never shifts the reels mid-reveal. */}
        <div className="flex min-h-dvh flex-col">
          <header className="shrink-0 border-b border-white/10 px-4 py-3">
            <div className="mx-auto flex w-full max-w-5xl items-center gap-1">
              <div className="min-w-0 flex-1">
                <h1 className="text-lg leading-none font-black">Сугалаа</h1>
                <p className="mt-1 text-xs text-white/50">
                  {state
                    ? `Сугалаанд ${pool} хүн · ирсэн ${state.checkedIn} · ${winners.length} азтан`
                    : "Уншиж байна…"}
                </p>
              </div>
              <button
                type="button"
                onClick={() => void refresh()}
                disabled={phase === "drawing"}
                aria-label="Шинэчлэх"
                className="grid size-11 place-items-center rounded-full text-white/70 hover:bg-white/10 disabled:opacity-40"
              >
                <RefreshCw className="size-5" />
              </button>
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
          </header>

          {loadError && (
            <p className="mx-auto mt-4 w-full max-w-5xl px-4 text-sm text-red-300">
              {loadError}
            </p>
          )}

          <section className="mx-auto flex w-full max-w-5xl flex-1 flex-col items-center justify-center gap-8 px-4 py-10 text-center">
            <p className="text-xs font-semibold tracking-[0.18em] text-[#F98C01]">
              2026.10.10 · FINGER PRINT · СУГАЛАА
            </p>

            <motion.div
              key={winner?.id ?? "idle"}
              initial={winner ? { scale: 1 } : false}
              animate={winner ? { scale: [1, 1.08, 1] } : { scale: 1 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            >
              <LotteryReels
                positions={reels.positions}
                label={winner ? winner.ticketCode : "Тасалбарын код"}
                className={cn(
                  "text-[clamp(1.75rem,8vw,5.5rem)] transition-[filter] duration-700",
                  winner && "drop-shadow-[0_0_28px_rgba(249,140,1,0.55)]",
                )}
              />
            </motion.div>

            <div
              className="flex min-h-[9.5rem] flex-col items-center justify-start"
              aria-live="polite"
            >
              {winner ? (
                <motion.div
                  key={winner.id}
                  initial={{ opacity: 0, y: 24, scale: 0.85 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ type: "spring", stiffness: 260, damping: 16, delay: 0.15 }}
                >
                  <p className="mb-2 text-sm font-bold tracking-[0.3em] text-[#F98C01]">АЗТАН</p>
                  <p className="font-display text-[clamp(1.75rem,5vw,3.5rem)] leading-tight font-bold">
                    {winner.fullName}
                  </p>
                  <p className="mt-1 text-[clamp(1rem,2vw,1.375rem)] text-white/60">
                    {winner.churchName}
                  </p>
                </motion.div>
              ) : (
                state && (
                  <p className="pt-4 text-base text-white/40">
                    {phase === "drawing"
                      ? "Сугалж байна…"
                      : pool === 0
                      ? "Сугалаанд оролцох хүн үлдсэнгүй"
                      : "Сугалахад бэлэн"}
                  </p>
                )
              )}
            </div>

            <div className="grid w-full max-w-sm gap-3">
              <button
                type="button"
                onClick={() => void draw()}
                disabled={!canDraw}
                className="h-14 rounded-full bg-[#F98C01] text-lg font-bold text-neutral-950 transition-colors hover:bg-[#e57f00] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white disabled:bg-white/10 disabled:text-white/40"
              >
                {phase === "drawing"
                  ? "Сугалж байна…"
                  : winner
                  ? "Дахин сугалах"
                  : "Сугалах"}
              </button>
              <p className="text-xs leading-relaxed text-white/40">
                Хаалган дээр бүртгүүлж орсон хүмүүсээс сугална. Өсвөрийн ахлагч,
                Магтаалын баг оролцохгүй. Нэг хүн хоёр удаа хожихгүй.
              </p>
            </div>
          </section>
        </div>

        {winners.length > 0 && (
          <section className="mx-auto w-full max-w-5xl px-4 pb-10">
            <h2 className="mb-2 text-sm font-semibold text-white/60">
              Азтангууд
            </h2>
            <ol className="grid gap-1.5">
              {winners.map((w, i) => (
                <li
                  key={w.id}
                  className={cn(
                    "flex items-center gap-3 rounded-xl bg-white/[0.05] px-4 py-3",
                    w.id === winner?.id && "bg-[#F98C01]/15"
                  )}
                >
                  <span className="w-6 shrink-0 text-sm text-white/40 tabular-nums">
                    {winners.length - i}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-semibold">
                      {w.fullName}
                    </span>
                    <span className="block truncate text-xs text-white/50">
                      {w.churchName} · {w.ticketCode}
                    </span>
                  </span>
                  {w.prize && (
                    <span className="hidden shrink-0 text-sm text-[#F9A43A] sm:block">
                      {w.prize}
                    </span>
                  )}
                  <span className="shrink-0 text-xs text-white/40 tabular-nums">
                    {formatTime(w.drawnAt)}
                  </span>
                  <button
                    type="button"
                    onClick={() => setRemoving(w)}
                    disabled={phase === "drawing"}
                    aria-label={`${w.fullName}-ийг жагсаалтаас хасах`}
                    className="grid size-9 shrink-0 place-items-center rounded-full text-white/40 hover:bg-white/10 hover:text-white disabled:opacity-40"
                  >
                    <X className="size-4" />
                  </button>
                </li>
              ))}
            </ol>
          </section>
        )}

        <ConfirmDialog
          open={removing !== null}
          onOpenChange={(open) => !open && setRemoving(null)}
          working={working}
          title={removing ? `${removing.fullName}-ийг азтнуудаас хасах уу?` : ""}
          confirmLabel="Тийм, хас"
          body={
            <>
              <p>Танхимд байхгүй эсвэл андуурч сугалсан бол хасна.</p>
              <p>Хасагдсан хүн дахин сугалаанд орно.</p>
            </>
          }
          onConfirm={() => void confirmRemove()}
        />
      </main>
    </MotionConfig>
  );
}
