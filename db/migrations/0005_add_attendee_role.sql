-- Adds attendees.role so someone can register as the youth leader bringing a
-- group ("өсвөрийн ахлагч") rather than picking a school year. A leader has
-- no year, so grade also has to stop being NOT NULL.
--
-- On the form these are one question and one select; they're two columns
-- here because "which year" and "is a leader" are different facts, and the
-- admin monitor filters, sorts and counts on each.
--
-- SQLite can't relax a NOT NULL in place, so the table is rebuilt. Nothing
-- references attendees, so no foreign key needs deferring; dropping the old
-- table takes its indexes with it and they're recreated below. Existing rows
-- all predate the choice, so they're students by definition.
--
-- Safe to run whether or not 0004 has been applied — the rebuilt table has
-- the relaxed columns either way.
--
-- Run with:
--   bunx wrangler d1 execute finger-print-2026 --remote \
--     --file=./db/migrations/0005_add_attendee_role.sql

CREATE TABLE attendees_new (
  id TEXT PRIMARY KEY,
  registration_id TEXT NOT NULL REFERENCES registrations (id),
  full_name TEXT NOT NULL,
  age INTEGER,
  phone TEXT,
  parent_phone TEXT,
  church_name TEXT NOT NULL,
  grade INTEGER,
  role TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'youth_leader')),
  ticket_code TEXT,
  checked_in_at TEXT,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

INSERT INTO attendees_new (
  id, registration_id, full_name, age, phone, parent_phone,
  church_name, grade, role, ticket_code, checked_in_at, created_at
)
SELECT id, registration_id, full_name, age, phone, parent_phone,
       church_name, grade, 'student', ticket_code, checked_in_at, created_at
FROM attendees;

DROP TABLE attendees;

ALTER TABLE attendees_new RENAME TO attendees;

CREATE INDEX IF NOT EXISTS idx_attendees_registration_id ON attendees (registration_id);
CREATE INDEX IF NOT EXISTS idx_attendees_phone ON attendees (phone);
CREATE INDEX IF NOT EXISTS idx_attendees_parent_phone ON attendees (parent_phone);
CREATE INDEX IF NOT EXISTS idx_attendees_church_name ON attendees (church_name);
CREATE INDEX IF NOT EXISTS idx_attendees_role ON attendees (role);
CREATE UNIQUE INDEX IF NOT EXISTS idx_attendees_ticket_code ON attendees (ticket_code);
