-- Prepares registrations for a rush.
--
-- idempotency_key: the form sends one key per submission attempt, so a
--   double tap, a retried request or a second tab returns the registration
--   that already exists instead of creating a second, unpaid copy.
-- expires_at: how long an unpaid registration holds its seats. Only matters
--   when a capacity is set; a pending row past this time stops counting
--   against it (a bank transfer awaiting verification always counts).
-- settings: the switches the admin monitor's "Бүртгэлийн тохиргоо" panel
--   edits. A blank capacity means no limit.
--
-- Additive only. Apply BEFORE deploying the code that writes these columns.
--
-- Run with:
--   bunx wrangler d1 execute finger-print-2026 --remote \
--     --file=./db/migrations/0007_registration_capacity_and_idempotency.sql

ALTER TABLE registrations ADD COLUMN idempotency_key TEXT;
ALTER TABLE registrations ADD COLUMN expires_at TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS idx_registrations_idempotency_key
  ON registrations (idempotency_key);

CREATE INDEX IF NOT EXISTS idx_attendees_checked_in_at ON attendees (checked_in_at);

INSERT OR IGNORE INTO settings (key, value) VALUES
  ('registration_state', 'open'),
  ('capacity', ''),
  ('queue_mode', 'auto'),
  ('queue_admit_per_minute', '20'),
  ('queue_burst', '10');
