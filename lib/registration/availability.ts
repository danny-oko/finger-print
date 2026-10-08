import { cached } from "@/lib/cache";
import { d1QueryOne } from "@/lib/db/d1";
import { getRegistrationSettings, type RegistrationState } from "@/lib/registration/settings";

// Seats are held by paid registrations, and by unpaid ones for a while after
// they're made — long enough to finish paying, short enough that an abandoned
// checkout gives its seats back. A claimed bank transfer keeps its seats
// until a human looks at it.
export const LIVE_SEATS_SQL = `
  SELECT COALESCE(SUM(attendee_count), 0) FROM registrations
   WHERE status = 'paid'
      OR (status = 'pending' AND (awaiting_verification_at IS NOT NULL OR expires_at > ?))`;

export const HOLD_MINUTES = { checkout: 45, invoice: 24 * 60 } as const;

export function holdExpiry(method: keyof typeof HOLD_MINUTES, now = Date.now()): string {
  return new Date(now + HOLD_MINUTES[method] * 60_000).toISOString();
}

export type AvailabilityStatus = RegistrationState | "sold_out";

export type Availability = {
  status: AvailabilityStatus;
  capacity: number | null;
  seatsLeft: number | null;
};

// Short: it's shown to people deciding whether to hurry, and a sold-out
// answer that's a minute stale is the one that costs someone a seat.
const seatsTaken = cached(5_000, async () => {
  const row = await d1QueryOne<{ taken: number }>(
    `SELECT (${LIVE_SEATS_SQL}) AS taken`,
    [new Date().toISOString()],
  );
  return row?.taken ?? 0;
});

export async function getAvailability(): Promise<Availability> {
  const settings = await getRegistrationSettings();

  if (settings.state !== "open") {
    return { status: settings.state, capacity: settings.capacity, seatsLeft: null };
  }

  if (settings.capacity === null) return { status: "open", capacity: null, seatsLeft: null };

  const seatsLeft = Math.max(0, settings.capacity - (await seatsTaken()));
  return {
    status: seatsLeft > 0 ? "open" : "sold_out",
    capacity: settings.capacity,
    seatsLeft,
  };
}

// Regardless of the open/closed switch, which staff registrations ignore.
export async function seatsLeft(): Promise<number | null> {
  const { capacity } = await getRegistrationSettings();
  if (capacity === null) return null;
  return Math.max(0, capacity - (await seatsTaken()));
}

export function invalidateSeats() {
  seatsTaken.invalidate();
}
