-- Finger Print conference registration schema (Cloudflare D1 / SQLite)
-- Run with:
--   bunx wrangler d1 execute finger-print-registration --remote --file=./db/schema.sql

CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

INSERT OR IGNORE INTO settings (key, value) VALUES
  ('price_per_attendee_mnt', '15000'),
  ('tax_rate_percent', '0'),
  ('currency', 'MNT');

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
  attendee_count INTEGER NOT NULL,
  price_per_attendee_mnt INTEGER NOT NULL,
  tax_rate_percent INTEGER NOT NULL,
  subtotal_mnt INTEGER NOT NULL,
  tax_mnt INTEGER NOT NULL,
  total_mnt INTEGER NOT NULL,
  currency TEXT NOT NULL DEFAULT 'MNT',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'failed', 'expired', 'cancelled')),
  bonum_invoice_id TEXT,
  bonum_transaction_id TEXT UNIQUE,
  bonum_follow_up_link TEXT,
  paid_at TEXT,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

CREATE INDEX IF NOT EXISTS idx_registrations_payer_phone ON registrations (payer_phone);
CREATE INDEX IF NOT EXISTS idx_registrations_bonum_transaction_id ON registrations (bonum_transaction_id);

CREATE TABLE IF NOT EXISTS attendees (
  id TEXT PRIMARY KEY,
  registration_id TEXT NOT NULL REFERENCES registrations (id),
  full_name TEXT NOT NULL,
  age INTEGER NOT NULL,
  phone TEXT,
  parent_phone TEXT NOT NULL,
  church_name TEXT NOT NULL,
  grade INTEGER NOT NULL,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

CREATE INDEX IF NOT EXISTS idx_attendees_registration_id ON attendees (registration_id);
CREATE INDEX IF NOT EXISTS idx_attendees_phone ON attendees (phone);
CREATE INDEX IF NOT EXISTS idx_attendees_parent_phone ON attendees (parent_phone);

CREATE TABLE IF NOT EXISTS payment_events (
  id TEXT PRIMARY KEY,
  registration_id TEXT REFERENCES registrations (id),
  event_type TEXT NOT NULL,
  status TEXT,
  checksum_valid INTEGER NOT NULL,
  raw_payload TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

CREATE INDEX IF NOT EXISTS idx_payment_events_registration_id ON payment_events (registration_id);
