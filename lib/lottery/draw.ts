import { randomInt, randomUUID } from "node:crypto";

import { d1Batch, type D1Statement } from "@/lib/db/d1";
import type { LotteryState, LotteryWinner } from "@/lib/lottery/types";

// Only people a door scanner checked in can win, and nobody wins twice. The
// pick happens here with a CSPRNG over the eligible ticket codes; the screen
// just animates towards whatever this returns, so it can never land on a
// code that isn't a real, present attendee.

type WinnerRow = {
  id: string;
  attendee_id: string;
  ticket_code: string;
  full_name: string;
  church_name: string;
  prize: string | null;
  drawn_at: string;
};

const WINNER_COLUMNS = "id, attendee_id, ticket_code, full_name, church_name, prize, drawn_at";

const CHECKED_IN = `FROM attendees a
  JOIN registrations r ON r.id = a.registration_id
 WHERE a.checked_in_at IS NOT NULL
   AND a.ticket_code IS NOT NULL
   AND r.status = 'paid'`;

const ELIGIBLE = `${CHECKED_IN}
   AND NOT EXISTS (SELECT 1 FROM lottery_winners w WHERE w.attendee_id = a.id)`;

const COUNTS: D1Statement = {
  sql: `SELECT COUNT(*) AS checked_in,
               COALESCE(SUM(CASE WHEN w.id IS NULL THEN 1 ELSE 0 END), 0) AS pool
          FROM attendees a
          JOIN registrations r ON r.id = a.registration_id
          LEFT JOIN lottery_winners w ON w.attendee_id = a.id
         WHERE a.checked_in_at IS NOT NULL
           AND a.ticket_code IS NOT NULL
           AND r.status = 'paid'`,
};

const WINNERS: D1Statement = {
  sql: `SELECT ${WINNER_COLUMNS} FROM lottery_winners ORDER BY drawn_at DESC`,
};

export class LotteryPoolEmptyError extends Error {
  constructor() {
    super("lottery_pool_empty");
    this.name = "LotteryPoolEmptyError";
  }
}

function toWinner(row: WinnerRow): LotteryWinner {
  return {
    id: row.id,
    attendeeId: row.attendee_id,
    ticketCode: row.ticket_code,
    fullName: row.full_name,
    churchName: row.church_name,
    prize: row.prize,
    drawnAt: row.drawn_at,
  };
}

function toState(counts: unknown[], winners: unknown[]): LotteryState {
  const row = counts[0] as { checked_in?: number; pool?: number } | undefined;
  return {
    checkedIn: row?.checked_in ?? 0,
    pool: row?.pool ?? 0,
    winners: (winners as WinnerRow[]).map(toWinner),
  };
}

export async function getLotteryState(): Promise<LotteryState> {
  const [counts, winners] = await d1Batch([COUNTS, WINNERS]);
  return toState(counts.rows, winners.rows);
}

// A pick only misses when someone else's draw, or an undone check-in, takes
// that person in the instant between reading the pool and writing the win.
const MAX_ATTEMPTS = 5;

export async function drawWinner(
  prize: string | null,
): Promise<{ winner: LotteryWinner; state: LotteryState }> {
  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    const [candidates] = await d1Batch<{ id: string }>([
      { sql: `SELECT a.id ${ELIGIBLE} ORDER BY a.ticket_code` },
    ]);
    if (candidates.rows.length === 0) throw new LotteryPoolEmptyError();

    const pick = candidates.rows[randomInt(candidates.rows.length)];

    // The eligibility check is repeated inside the INSERT, and the batch
    // runs as one transaction, so a stale pick inserts nothing rather than a
    // winner who is no longer eligible.
    const [inserted, counts, winners] = await d1Batch([
      {
        sql: `INSERT OR IGNORE INTO lottery_winners (${WINNER_COLUMNS})
              SELECT ?, a.id, a.ticket_code, a.full_name, a.church_name, ?, ?
              ${ELIGIBLE} AND a.id = ?
              RETURNING ${WINNER_COLUMNS}`,
        params: [randomUUID(), prize, new Date().toISOString(), pick.id],
      },
      COUNTS,
      WINNERS,
    ]);

    const row = inserted.rows[0] as WinnerRow | undefined;
    if (row) return { winner: toWinner(row), state: toState(counts.rows, winners.rows) };
  }

  throw new Error("lottery draw kept losing its pick to concurrent changes");
}

export async function removeWinner(winnerId: string): Promise<LotteryState | null> {
  const [removed, counts, winners] = await d1Batch([
    { sql: "DELETE FROM lottery_winners WHERE id = ? RETURNING id", params: [winnerId] },
    COUNTS,
    WINNERS,
  ]);
  if (removed.rows.length === 0) return null;
  return toState(counts.rows, winners.rows);
}
