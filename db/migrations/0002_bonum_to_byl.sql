-- Migrates an already-provisioned database from the Bonum payment gateway
-- to Byl (byl.mn). Skip this if you're setting up D1 from scratch —
-- db/schema.sql already reflects the Byl columns.
--
-- Run with:
--   bunx wrangler d1 execute finger-print-2026 --remote \
--     --file=./db/migrations/0002_bonum_to_byl.sql

DROP INDEX IF EXISTS idx_registrations_bonum_transaction_id;

-- Bonum identified a payment by an invoice id + our own transaction id, and
-- handed back a "follow up link". Byl's equivalents are a checkout id, our
-- client_reference_id (still the registration id), and the hosted checkout
-- url, so the three columns carry over one-for-one.
ALTER TABLE registrations RENAME COLUMN bonum_invoice_id TO byl_checkout_id;
ALTER TABLE registrations RENAME COLUMN bonum_transaction_id TO byl_client_reference_id;
ALTER TABLE registrations RENAME COLUMN bonum_follow_up_link TO byl_checkout_url;

-- Byl reports a claimed-but-unconfirmed bank transfer as its own event
-- (payment.awaiting_verification). The registration stays 'pending' until
-- the merchant confirms it; this records that it's waiting on a human.
ALTER TABLE registrations ADD COLUMN awaiting_verification_at TEXT;

-- Bonum signed webhooks with an "x-checksum-v2" header; Byl signs with
-- "Byl-Signature". Same idea, so the audit column is just renamed.
ALTER TABLE payment_events RENAME COLUMN checksum_valid TO signature_valid;

CREATE INDEX IF NOT EXISTS idx_registrations_byl_client_reference_id ON registrations (byl_client_reference_id);
CREATE INDEX IF NOT EXISTS idx_registrations_byl_checkout_id ON registrations (byl_checkout_id);
CREATE INDEX IF NOT EXISTS idx_registrations_status ON registrations (status);
CREATE INDEX IF NOT EXISTS idx_registrations_created_at ON registrations (created_at);
CREATE INDEX IF NOT EXISTS idx_attendees_church_name ON attendees (church_name);
