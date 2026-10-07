// Every character a ticket code can contain, in the order a reel shows them.
export const REEL_GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

/** "FP-D5Y3-HJEJ" -> the ten characters the ten reels stop on. */
export function reelTargets(ticketCode: string): number[] {
  return [...ticketCode.toUpperCase().replace(/[^A-Z0-9]/g, "")].map((char) =>
    Math.max(REEL_GLYPHS.indexOf(char), 0),
  );
}

/**
 * How far a reel spinning at `speed` (glyphs/s) travels to come to rest on
 * `target`, and how long that takes. The stop is a cubic ease-out, whose
 * starting speed is 3 × distance / duration — solving for the duration keeps
 * the hand-off from constant spin seamless, so nothing visibly jumps.
 */
export function planLanding(
  position: number,
  speed: number,
  target: number,
  length: number,
  minMs: number,
): { distance: number; ms: number } {
  const minDistance = (speed * minMs) / 1000 / 3;
  const ahead = (((target - position) % length) + length) % length;
  const laps = Math.max(0, Math.ceil((minDistance - ahead) / length));
  const distance = ahead + laps * length;
  return { distance, ms: (3 * distance * 1000) / speed };
}

export function easeOutCubic(t: number): number {
  return 1 - (1 - t) ** 3;
}
