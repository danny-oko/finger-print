-- Lets someone register as the praise team ("Магтаалын баг") rather than
-- picking a school year, the same way a youth leader does. Like a leader,
-- they have no year, so grade stays NULL for them.
--
-- SQLite can't change a CHECK in place, so the table is rebuilt as in 0005.
-- Nothing references attendees by foreign key (lottery_winners.attendee_id
-- deliberately has none), so the rebuild keeps every id and nothing dangles.
--
-- Apply BEFORE deploying the code that offers the new choice — until then a
-- praise team registration would fail the old CHECK.
--
-- Run with:
--   bunx wrangler d1 execute finger-print-2026 --remote \
--     --file=./db/migrations/0009_add_praise_team_role.sql

CREATE TABLE attendees_new (
  id TEXT PRIMARY KEY,
  registration_id TEXT NOT NULL REFERENCES registrations (id),
  full_name TEXT NOT NULL,
  age INTEGER,
  phone TEXT,
  parent_phone TEXT,
  church_name TEXT NOT NULL,
  grade INTEGER,
  role TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'youth_leader', 'praise_team')),
  ticket_code TEXT,
  checked_in_at TEXT,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

INSERT INTO attendees_new (
  id, registration_id, full_name, age, phone, parent_phone,
  church_name, grade, role, ticket_code, checked_in_at, created_at
)
SELECT id, registration_id, full_name, age, phone, parent_phone,
       church_name, grade, role, ticket_code, checked_in_at, created_at
FROM attendees;

DROP TABLE attendees;

ALTER TABLE attendees_new RENAME TO attendees;

CREATE INDEX IF NOT EXISTS idx_attendees_registration_id ON attendees (registration_id);
CREATE INDEX IF NOT EXISTS idx_attendees_phone ON attendees (phone);
CREATE INDEX IF NOT EXISTS idx_attendees_parent_phone ON attendees (parent_phone);
CREATE INDEX IF NOT EXISTS idx_attendees_church_name ON attendees (church_name);
CREATE INDEX IF NOT EXISTS idx_attendees_role ON attendees (role);
CREATE UNIQUE INDEX IF NOT EXISTS idx_attendees_ticket_code ON attendees (ticket_code);
CREATE INDEX IF NOT EXISTS idx_attendees_checked_in_at ON attendees (checked_in_at);
