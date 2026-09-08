-- Retires attendees.age. Grade (7-12) already carries the same signal, so
-- the form stopped asking for it and nothing reads it any more — but the
-- column is kept, nullable, so the ages collected before this change aren't
-- thrown away. New rows simply leave it NULL.
--
-- SQLite can't relax a NOT NULL in place, so the table is rebuilt. Nothing
-- references attendees, so no foreign key needs deferring; dropping the old
-- table takes its indexes with it and they're recreated below.
--
-- Run with:
--   bunx wrangler d1 execute finger-print-2026 --remote \
--     --file=./db/migrations/0004_retire_attendee_age.sql

CREATE TABLE attendees_new (
  id TEXT PRIMARY KEY,
  registration_id TEXT NOT NULL REFERENCES registrations (id),
  full_name TEXT NOT NULL,
  age INTEGER,
  phone TEXT,
  parent_phone TEXT NOT NULL,
  church_name TEXT NOT NULL,
  grade INTEGER NOT NULL,
  ticket_code TEXT,
  checked_in_at TEXT,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

INSERT INTO attendees_new (
  id, registration_id, full_name, age, phone, parent_phone,
  church_name, grade, ticket_code, checked_in_at, created_at
)
SELECT id, registration_id, full_name, age, phone, parent_phone,
       church_name, grade, ticket_code, checked_in_at, created_at
FROM attendees;

DROP TABLE attendees;

ALTER TABLE attendees_new RENAME TO attendees;

CREATE INDEX IF NOT EXISTS idx_attendees_registration_id ON attendees (registration_id);
CREATE INDEX IF NOT EXISTS idx_attendees_phone ON attendees (phone);
CREATE INDEX IF NOT EXISTS idx_attendees_parent_phone ON attendees (parent_phone);
CREATE INDEX IF NOT EXISTS idx_attendees_church_name ON attendees (church_name);
CREATE UNIQUE INDEX IF NOT EXISTS idx_attendees_ticket_code ON attendees (ticket_code);
