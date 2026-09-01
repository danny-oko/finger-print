-- Adds QR-ticket + payer email support to an already-provisioned database.
-- Skip this if you're setting up D1 from scratch — db/schema.sql already
-- includes these columns.
--
-- Run with:
--   bunx wrangler d1 execute finger-print-2026 --remote --file=./db/migrations/0001_add_ticketing.sql

ALTER TABLE registrations ADD COLUMN payer_email TEXT;
ALTER TABLE registrations ADD COLUMN tickets_issued_at TEXT;

ALTER TABLE attendees ADD COLUMN ticket_code TEXT;
ALTER TABLE attendees ADD COLUMN checked_in_at TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS idx_attendees_ticket_code ON attendees (ticket_code);
