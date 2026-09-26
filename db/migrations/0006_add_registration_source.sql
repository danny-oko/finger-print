-- Adds registrations.source so a registration made through the private
-- invite link can be told apart from a public, paid one. An invited
-- registration is stored as 'paid' with a zero total — that's what lets the
-- ticket page, the phone lookup and the door scanner treat it like any other
-- confirmed ticket — so without this column the admin monitor couldn't label
-- it or keep it out of revenue.
--
-- Additive only: every existing row becomes 'public'.
--
-- Run with:
--   bunx wrangler d1 execute finger-print-2026 --remote \
--     --file=./db/migrations/0006_add_registration_source.sql

ALTER TABLE registrations
  ADD COLUMN source TEXT NOT NULL DEFAULT 'public' CHECK (source IN ('public', 'invite'));

CREATE INDEX IF NOT EXISTS idx_registrations_source ON registrations (source);
