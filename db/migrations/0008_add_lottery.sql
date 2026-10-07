-- Prize draw winners, picked on /admin/lottery from the people checked in at
-- the door.
--
-- The name, church and ticket code are copied in at the moment of the draw,
-- so the winner list reads the same even if the attendee is later edited or
-- removed — and attendee_id deliberately has no foreign key, so a past win
-- never blocks deleting an attendee. UNIQUE on attendee_id is what stops one
-- person winning twice, even when two screens draw at the same moment.
--
-- Additive only. Apply BEFORE deploying the code that reads this table.
--
-- Run with:
--   bunx wrangler d1 execute finger-print-2026 --remote \
--     --file=./db/migrations/0008_add_lottery.sql

CREATE TABLE IF NOT EXISTS lottery_winners (
  id TEXT PRIMARY KEY,
  attendee_id TEXT NOT NULL UNIQUE,
  ticket_code TEXT NOT NULL,
  full_name TEXT NOT NULL,
  church_name TEXT NOT NULL,
  prize TEXT,
  drawn_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

CREATE INDEX IF NOT EXISTS idx_lottery_winners_drawn_at ON lottery_winners (drawn_at);
