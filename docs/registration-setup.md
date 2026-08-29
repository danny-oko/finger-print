# Registration + payment: one-time setup

This covers the manual steps needed once, outside the codebase, to make
`/event/registration` fully work in production. Everything else (schema,
API routes, UI) is already implemented.

## 1. Create the Cloudflare D1 database

```bash
bunx wrangler login
bunx wrangler d1 create finger-print-registration
```

This prints a `database_id` — save it for step 3.

Apply the schema:

```bash
bunx wrangler d1 execute finger-print-registration --remote --file=./db/schema.sql
```

## 2. Create a Cloudflare API token

In the Cloudflare dashboard → **My Profile → API Tokens → Create Token**,
use the "Edit Cloudflare Workers" template or a custom token with the
**D1 → Edit** permission, scoped to your account. Copy the token — it's
only shown once.

## 3. Fill in the Cloudflare env vars

```
CLOUDFLARE_ACCOUNT_ID=<your account id, shown in the dashboard sidebar>
CLOUDFLARE_D1_DATABASE_ID=<database_id from step 1>
CLOUDFLARE_API_TOKEN=<token from step 2>
```

## 4. Get production Bonum credentials

`.env.example` ships Bonum's public **sandbox** credentials so local dev
and testing work immediately against `https://testapi.bonum.mn`. Before
going live:

1. Contact Bonum (support@bonum.mn / +976 7200-5000, or via
   https://merchant.bonum.mn/) to get your production `APP_SECRET`,
   `TERMINAL_ID` and `MERCHANT_CHECKSUM_KEY`.
2. Register your production webhook URL with them:
   `https://finger-print.org/api/registration/bonum-webhook`
3. Set `BONUM_BASE_URL=https://apis.bonum.mn` and swap in the real
   `BONUM_APP_SECRET` / `BONUM_TERMINAL_ID` / `BONUM_MERCHANT_CHECKSUM_KEY`.

## 5. Add QR-ticket support to an existing database

Skip this if you just created the database in step 1 — `db/schema.sql`
already includes the ticketing columns. If the database already existed
before this feature, apply the migration once:

```bash
bunx wrangler d1 execute finger-print-2026 --remote \
  --file=./db/migrations/0001_add_ticketing.sql
```

## 6. Create a Gmail App Password (for sending ticket emails)

Once a registration is paid, the app emails a QR ticket per attendee via
Gmail SMTP (`lib/email/sendTicketEmail.ts`). This needs an **App Password**,
not the account's normal login password:

1. Turn on 2-Step Verification on the sending Gmail account, if it isn't
   already: https://myaccount.google.com/security
2. Go to https://myaccount.google.com/apppasswords, create a new app
   password (any name, e.g. "Finger Print website"), and copy the
   16-character password shown.
3. Set:
   ```
   GMAIL_USER=<the sending gmail address>
   GMAIL_APP_PASSWORD=<the 16-character app password, no spaces>
   ```

Gmail SMTP has a soft daily sending cap (~500 emails/day on a regular
account) — plenty for ticket confirmations, but worth knowing if attendee
volume grows a lot.

## 7. Set the real registration price

The price and tax rate are stored in D1, not hardcoded, so they can be
updated anytime without a redeploy:

```bash
bunx wrangler d1 execute finger-print-registration --remote --command \
  "UPDATE settings SET value = '20000' WHERE key = 'price_per_attendee_mnt'"

bunx wrangler d1 execute finger-print-registration --remote --command \
  "UPDATE settings SET value = '10' WHERE key = 'tax_rate_percent'"
```

## 8. Set env vars in Vercel

Add everything from `.env.example` (with real values) to the Vercel
project's Environment Variables, plus:

```
NEXT_PUBLIC_SITE_URL=https://finger-print.org
```

## Useful queries while testing

```bash
# See all registrations
bunx wrangler d1 execute finger-print-registration --remote --command \
  "SELECT id, registrant_type, payer_name, payer_phone, status, total_mnt FROM registrations ORDER BY created_at DESC"

# See attendees for a registration
bunx wrangler d1 execute finger-print-registration --remote --command \
  "SELECT * FROM attendees WHERE registration_id = '<id>'"

# See raw webhook events (useful for debugging Bonum callbacks)
bunx wrangler d1 execute finger-print-registration --remote --command \
  "SELECT * FROM payment_events ORDER BY created_at DESC LIMIT 20"
```
