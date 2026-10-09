import { randomInt, randomUUID } from "node:crypto";

import { d1Batch, type D1Statement } from "@/lib/db/d1";
import { canWinLottery } from "@/lib/lottery/eligibility";
import type { LotteryState, LotteryWinner } from "@/lib/lottery/types";
import { PRAISE_TEAM, YOUTH_LEADER } from "@/lib/registration/grade";

// Only people a door scanner checked in can win, and nobody wins twice. The
// pick happens here with a CSPRNG over the eligible ticket codes; the screen
// just animates towards whatever this returns, so it can never land on a
// code that isn't a real, present attendee. Youth leaders and the serving
// teams in lib/lottery/eligibility.ts are never in the pool.

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

// The church rule needs the fuzzy name match, so it's applied in code to
// these rows; the role rules are plain enough to sit in the SQL as well.
const ELIGIBLE = `${CHECKED_IN}
   AND a.role NOT IN ('${YOUTH_LEADER}', '${PRAISE_TEAM}')
   AND NOT EXISTS (SELECT 1 FROM lottery_winners w WHERE w.attendee_id = a.id)`;

type PresentRow = { id: string; role: string; church_name: string; won: number };

const PRESENT: D1Statement = {
  sql: `SELECT a.id, a.role, a.church_name, w.id IS NOT NULL AS won
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

const eligible = (row: { role: string; church_name: string }) =>
  canWinLottery({ role: row.role, churchName: row.church_name });

function toState(present: unknown[], winners: unknown[]): LotteryState {
  const rows = present as PresentRow[];
  return {
    checkedIn: rows.length,
    pool: rows.filter((row) => !row.won && eligible(row)).length,
    winners: (winners as WinnerRow[]).map(toWinner),
  };
}

export async function getLotteryState(): Promise<LotteryState> {
  const [present, winners] = await d1Batch([PRESENT, WINNERS]);
  return toState(present.rows, winners.rows);
}

// A pick only misses when someone else's draw, or an undone check-in, takes
// that person in the instant between reading the pool and writing the win.
const MAX_ATTEMPTS = 5;

export async function drawWinner(
  prize: string | null,
): Promise<{ winner: LotteryWinner; state: LotteryState }> {
  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    const [found] = await d1Batch<{ id: string; role: string; church_name: string }>([
      { sql: `SELECT a.id, a.role, a.church_name ${ELIGIBLE} ORDER BY a.ticket_code` },
    ]);
    const candidates = found.rows.filter(eligible);
    if (candidates.length === 0) throw new LotteryPoolEmptyError();

    const pick = candidates[randomInt(candidates.length)];

    // The eligibility check is repeated inside the INSERT, and the batch
    // runs as one transaction, so a stale pick inserts nothing rather than a
    // winner who is no longer eligible.
    const [inserted, present, winners] = await d1Batch([
      {
        sql: `INSERT OR IGNORE INTO lottery_winners (${WINNER_COLUMNS})
              SELECT ?, a.id, a.ticket_code, a.full_name, a.church_name, ?, ?
              ${ELIGIBLE} AND a.id = ?
              RETURNING ${WINNER_COLUMNS}`,
        params: [randomUUID(), prize, new Date().toISOString(), pick.id],
      },
      PRESENT,
      WINNERS,
    ]);

    const row = inserted.rows[0] as WinnerRow | undefined;
    if (row) return { winner: toWinner(row), state: toState(present.rows, winners.rows) };
  }

  throw new Error("lottery draw kept losing its pick to concurrent changes");
}

export async function removeWinner(winnerId: string): Promise<LotteryState | null> {
  const [removed, present, winners] = await d1Batch([
    { sql: "DELETE FROM lottery_winners WHERE id = ? RETURNING id", params: [winnerId] },
    PRESENT,
    WINNERS,
  ]);
  if (removed.rows.length === 0) return null;
  return toState(present.rows, winners.rows);
}
