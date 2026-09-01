-- Records the Byl-Signature header we actually received, alongside whether it
-- verified. Without it a signature failure is a dead end: you can see that
-- the check failed, but not what the sender signed with, so you can't tell a
-- wrong secret from a different signature format. The value is a digest, not
-- a credential.
--
-- Run with:
--   bunx wrangler d1 execute finger-print-2026 --remote \
--     --file=./db/migrations/0003_log_webhook_signature.sql

ALTER TABLE payment_events ADD COLUMN received_signature TEXT;
