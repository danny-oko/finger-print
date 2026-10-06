import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const queue = { mode: "auto" as "auto" | "off", admitPerMinute: 60, burst: 2 };

vi.mock("@/lib/registration/settings", () => ({
  getRegistrationSettings: async () => ({ queue }),
}));

const { checkPass, joinQueue, leaveQueue, pollQueue, resetMemoryRoom } = await import(
  "@/lib/queue/waitingRoom"
);

type Waiting = { state: "waiting"; ticket: string; position: number };
type Admitted = { state: "admitted"; pass: string };

describe("waiting room (memory backend)", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-10-01T00:00:00Z"));
    resetMemoryRoom();
    Object.assign(queue, { mode: "auto", admitPerMinute: 60, burst: 2 });
  });
  afterEach(() => vi.useRealTimers());

  it("lets a burst straight through, then lines people up in arrival order", async () => {
    const a = await joinQueue();
    const b = await joinQueue();
    const c = (await joinQueue()) as Waiting;
    const d = (await joinQueue()) as Waiting;

    expect(a.state).toBe("admitted");
    expect(b.state).toBe("admitted");
    expect(c).toMatchObject({ state: "waiting", position: 1 });
    expect(d).toMatchObject({ state: "waiting", position: 2 });
  });

  it("admits at the configured rate as time passes", async () => {
    await joinQueue();
    await joinQueue();
    const c = (await joinQueue()) as Waiting;
    const d = (await joinQueue()) as Waiting;

    vi.advanceTimersByTime(1_000); // 60/min → one per second
    expect((await pollQueue(c.ticket)).state).toBe("admitted");
    expect(await pollQueue(d.ticket)).toMatchObject({ state: "waiting", position: 1 });

    vi.advanceTimersByTime(1_000);
    expect((await pollQueue(d.ticket)).state).toBe("admitted");
  });

  it("drops people who stop polling, so the line doesn't stall behind them", async () => {
    await joinQueue();
    await joinQueue();
    await joinQueue(); // goes silent
    const real = (await joinQueue()) as Waiting;
    expect(real.position).toBe(2);

    queue.admitPerMinute = 0.001; // effectively nobody is admitted meanwhile
    for (let i = 0; i < 10; i++) {
      vi.advanceTimersByTime(10_000);
      await pollQueue(real.ticket);
    }
    expect(await pollQueue(real.ticket)).toMatchObject({ state: "waiting", position: 1 });
  });

  it("puts someone who slept through polls back at their old place", async () => {
    await joinQueue();
    await joinQueue();
    const first = (await joinQueue()) as Waiting;
    const second = (await joinQueue()) as Waiting;

    queue.admitPerMinute = 0.001;
    for (let i = 0; i < 10; i++) {
      vi.advanceTimersByTime(10_000);
      await pollQueue(second.ticket);
    }
    expect(await pollQueue(second.ticket)).toMatchObject({ position: 1 });

    expect(await pollQueue(first.ticket)).toMatchObject({ state: "waiting", position: 1 });
    expect(await pollQueue(second.ticket)).toMatchObject({ position: 2 });
  });

  it("forgets a ticket that left the line", async () => {
    await joinQueue();
    await joinQueue();
    const c = (await joinQueue()) as Waiting;
    const d = (await joinQueue()) as Waiting;
    await leaveQueue(c.ticket);
    expect(await pollQueue(d.ticket)).toMatchObject({ position: 1 });
  });

  it("rejects forged and expired tickets", async () => {
    expect(await pollQueue("not-a-ticket")).toEqual({ state: "expired" });
    const c = (await joinQueue()) as Admitted;
    expect(await pollQueue(c.pass)).toEqual({ state: "expired" });
  });

  it("binds one pass to one submission", async () => {
    const { pass } = (await joinQueue()) as Admitted;
    expect(await checkPass(pass, "submission-1")).toEqual({ ok: true });
    expect(await checkPass(pass, "submission-1")).toEqual({ ok: true });
    expect(await checkPass(pass, "submission-2")).toEqual({ ok: false, reason: "used" });
    expect(await checkPass(null, "x")).toEqual({ ok: false, reason: "missing" });
    expect(await checkPass(`${pass}x`, "x")).toEqual({ ok: false, reason: "invalid" });
  });

  it("stays out of the way when switched off", async () => {
    queue.mode = "off";
    expect(await joinQueue()).toEqual({ state: "inactive" });
    expect(await checkPass(null)).toEqual({ ok: true });
  });
});
