-- Finger Print conference registration schema (Cloudflare D1 / SQLite)
-- Run with:
--   bunx wrangler d1 execute finger-print-2026 --remote --file=./db/schema.sql

CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

INSERT OR IGNORE INTO settings (key, value) VALUES
  ('price_per_attendee_mnt', '15000'),
  ('tax_rate_percent', '0'),
  ('currency', 'MNT'),
  ('registration_state', 'open'),
  ('capacity', ''),
  ('queue_mode', 'auto'),
  ('queue_admit_per_minute', '20'),
  ('queue_burst', '10');

CREATE TABLE IF NOT EXISTS churches (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

CREATE TABLE IF NOT EXISTS registrations (
  id TEXT PRIMARY KEY,
  registrant_type TEXT NOT NULL CHECK (registrant_type IN ('individual', 'church_leader')),
  payer_name TEXT NOT NULL,
  payer_phone TEXT NOT NULL,
  payer_email TEXT,
  attendee_count INTEGER NOT NULL,
  price_per_attendee_mnt INTEGER NOT NULL,
  tax_rate_percent INTEGER NOT NULL,
  subtotal_mnt INTEGER NOT NULL,
  tax_mnt INTEGER NOT NULL,
  total_mnt INTEGER NOT NULL,
  currency TEXT NOT NULL DEFAULT 'MNT',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'failed', 'expired', 'cancelled')),
  -- 'invite' rows came through the private invite link: stored as paid with a
  -- zero total. See migration 0006.
  source TEXT NOT NULL DEFAULT 'public' CHECK (source IN ('public', 'invite')),
  byl_checkout_id TEXT,
  byl_client_reference_id TEXT UNIQUE,
  byl_checkout_url TEXT,
  paid_at TEXT,
  awaiting_verification_at TEXT,
  tickets_issued_at TEXT,
  -- One per submission attempt, so a retried request finds the row it
  -- already made. See migration 0007.
  idempotency_key TEXT UNIQUE,
  -- How long an unpaid registration holds its seats. See migration 0007.
  expires_at TEXT,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

CREATE INDEX IF NOT EXISTS idx_registrations_payer_phone ON registrations (payer_phone);
CREATE INDEX IF NOT EXISTS idx_registrations_byl_client_reference_id ON registrations (byl_client_reference_id);
CREATE INDEX IF NOT EXISTS idx_registrations_byl_checkout_id ON registrations (byl_checkout_id);
CREATE INDEX IF NOT EXISTS idx_registrations_status ON registrations (status);
CREATE INDEX IF NOT EXISTS idx_registrations_created_at ON registrations (created_at);
CREATE INDEX IF NOT EXISTS idx_registrations_source ON registrations (source);

CREATE TABLE IF NOT EXISTS attendees (
  id TEXT PRIMARY KEY,
  registration_id TEXT NOT NULL REFERENCES registrations (id),
  full_name TEXT NOT NULL,
  -- Retired: grade already carries this. Kept nullable so previously
  -- collected ages survive; new rows leave it NULL. See migration 0004.
  age INTEGER,
  phone TEXT,
  -- Retired alongside age: the form no longer asks. Kept nullable so
  -- previously collected numbers survive. See migration 0004.
  parent_phone TEXT,
  church_name TEXT NOT NULL,
  -- Null for a youth leader, who has no school year. See migration 0005.
  grade INTEGER,
  role TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'youth_leader')),
  ticket_code TEXT,
  checked_in_at TEXT,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

CREATE INDEX IF NOT EXISTS idx_attendees_registration_id ON attendees (registration_id);
CREATE INDEX IF NOT EXISTS idx_attendees_phone ON attendees (phone);
CREATE INDEX IF NOT EXISTS idx_attendees_parent_phone ON attendees (parent_phone);
CREATE INDEX IF NOT EXISTS idx_attendees_church_name ON attendees (church_name);
CREATE INDEX IF NOT EXISTS idx_attendees_role ON attendees (role);
CREATE UNIQUE INDEX IF NOT EXISTS idx_attendees_ticket_code ON attendees (ticket_code);
CREATE INDEX IF NOT EXISTS idx_attendees_checked_in_at ON attendees (checked_in_at);

CREATE TABLE IF NOT EXISTS payment_events (
  id TEXT PRIMARY KEY,
  registration_id TEXT REFERENCES registrations (id),
  event_type TEXT NOT NULL,
  status TEXT,
  signature_valid INTEGER NOT NULL,
  received_signature TEXT,
  raw_payload TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

CREATE INDEX IF NOT EXISTS idx_payment_events_registration_id ON payment_events (registration_id);

-- Snapshot of each prize-draw winner. No foreign key on attendee_id on
-- purpose; see migration 0008.
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
