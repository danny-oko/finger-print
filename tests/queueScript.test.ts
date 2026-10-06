import RedisMock from "ioredis-mock";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/registration/settings", () => ({ getRegistrationSettings: async () => ({}) }));

const { QUEUE_SCRIPT } = await import("@/lib/queue/waitingRoom");

// The production waiting room is this Lua script on Upstash. ioredis-mock
// runs Lua, so the same script is exercised here against the same scenarios
// the memory backend is tested with.
const KEYS = ["wr:wait", "wr:seen", "wr:adm", "wr:bucket", "wr:seq"];
const GHOST = 90_000;
const PASS = 600_000;

describe("waiting room Lua script", () => {
  let redis: InstanceType<typeof RedisMock>;
  let now = 1_000_000;

  const run = (mode: string, id: string, n = 0, perMin = 60, burst = 2) =>
    redis.eval(QUEUE_SCRIPT, KEYS.length, ...KEYS, now, perMin / 60_000, burst, GHOST, PASS, mode, id, n) as Promise<
      [number, number, number, number]
    >;

  beforeEach(async () => {
    redis = new RedisMock();
    await redis.flushall();
    now = 1_000_000;
  });

  it("admits a burst, queues the rest in order, then admits at the rate", async () => {
    expect((await run("join", "a"))[0]).toBe(1);
    expect((await run("join", "b"))[0]).toBe(1);
    const c = await run("join", "c");
    const d = await run("join", "d");
    expect(c.slice(0, 2)).toEqual([0, 1]);
    expect(d.slice(0, 2)).toEqual([0, 2]);
    expect(c[3]).toBe(3); // the number drawn, carried in the ticket

    now += 1_000;
    expect((await run("poll", "c", c[3]))[0]).toBe(1);
    expect((await run("poll", "d", d[3])).slice(0, 2)).toEqual([0, 1]);
  });

  it("drops a silent ticket and restores it to its old place", async () => {
    await run("join", "a");
    await run("join", "b");
    const c = await run("join", "c");
    const d = await run("join", "d");

    for (let i = 0; i < 10; i++) {
      now += 10_000;
      await run("poll", "d", d[3], 0.001);
    }
    expect((await run("poll", "d", d[3], 0.001)).slice(0, 2)).toEqual([0, 1]);
    expect((await run("poll", "c", c[3], 0.001)).slice(0, 2)).toEqual([0, 1]);
    expect((await run("poll", "d", d[3], 0.001)).slice(0, 2)).toEqual([0, 2]);
  });

  it("removes a ticket that leaves", async () => {
    await run("join", "a");
    await run("join", "b");
    await run("join", "c");
    const d = await run("join", "d");
    await run("leave", "c");
    expect((await run("poll", "d", d[3])).slice(0, 2)).toEqual([0, 1]);
  });
});
