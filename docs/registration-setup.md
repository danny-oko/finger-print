# Registration + payment: one-time setup

This covers the manual steps needed once, outside the codebase, to make
`/event/registration` fully work in production. Everything else (schema,
API routes, UI) is already implemented.

## 1. Create the Cloudflare D1 database

```bash
bunx wrangler login
bunx wrangler d1 create finger-print-2026
```

This prints a `database_id` — save it for step 3.

Apply the schema:

```bash
bunx wrangler d1 execute finger-print-2026 --remote --file=./db/schema.sql
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

## 4. Set up Byl (payments)

Registration checkout runs on [Byl](https://byl.mn) (`byl.mn`), which
covers QPay, Golomt Bank merchant, SocialPay and Pocket behind one hosted
payment page.

1. Create a project in the Byl dashboard, then open
   **Settings → API Token** and create a token (e.g. "finger-print
   production"). **The token is shown only once** — copy it straight into
   your env vars.
2. Your project id is the number in the dashboard URL for that project.
3. Register the webhook endpoint under **Webhooks**:
   `https://finger-print.org/api/registration/byl-webhook`
   The URL must be `https://` and publicly reachable — Byl can't call
   `localhost`. For local testing, expose your dev server with ngrok and
   register that temporary URL instead.
4. Open the webhook endpoint's detail page and copy its **signing secret**.
   Every delivery is signed with it as HMAC-SHA256 in the `Byl-Signature`
   header, and `lib/byl.ts` rejects anything that doesn't verify.
5. Fill in:
   ```
   BYL_API_BASE_URL=https://byl.mn/api/v1
   BYL_PROJECT_ID=<your project id>
   BYL_API_TOKEN=<token from step 1>
   BYL_WEBHOOK_SECRET=<signing secret from step 4>
   ```

The app subscribes to two events:

| Event | Effect |
| --- | --- |
| `checkout.completed` | Registration → `paid`, QR tickets issued and emailed |
| `payment.awaiting_verification` | Stays `pending`, flagged in the admin monitor as a bank transfer a human still needs to confirm |

Byl expects a `2xx` within 5 seconds and retries with exponential backoff
otherwise, so the webhook route logs and acknowledges rather than letting a
slow email turn into a retry loop.

### Migrating an existing database from Bonum

If your D1 database was created before this switch, rename the old payment
columns once:

```bash
bunx wrangler d1 execute finger-print-2026 --remote \
  --file=./db/migrations/0002_bonum_to_byl.sql
```

## 5. Add QR-ticket support to an existing database

Skip this if you just created the database in step 1 — `db/schema.sql`
already includes the ticketing columns. If the database already existed
before this feature, apply the migration once:

```bash
bunx wrangler d1 execute finger-print-2026 --remote \
  --file=./db/migrations/0001_add_ticketing.sql
```

## 6. Create a Gmail App Password (optional — for emailing tickets)

This step is optional. Without it, a paid registration still issues every
attendee's QR ticket — registrants get them from the success page at
`/event/registration/<id>` (and each attendee's own `/event/ticket/<code>`)
instead of by email.

To also email them, the app uses Gmail SMTP (`lib/email/sendTicketEmail.ts`),
which needs an **App Password**, not the account's normal login password:

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
bunx wrangler d1 execute finger-print-2026 --remote --command \
  "UPDATE settings SET value = '20000' WHERE key = 'price_per_attendee_mnt'"

bunx wrangler d1 execute finger-print-2026 --remote --command \
  "UPDATE settings SET value = '10' WHERE key = 'tax_rate_percent'"
```

## 8. Set up the admin monitor

`/admin/registration-monitor` is the staff dashboard for watching
registrations come in.

The login is **opt-in**. With `ADMIN_PASSWORD` unset the dashboard is open to
anyone who knows the URL, and shows a warning banner saying so. Setting the
variable turns the login on — no code change, no redeploy of anything but the
env. There are no per-user admin accounts; the dashboard is read-only and the
team is small, so one shared password is the right amount of machinery.

Leaving it open publishes every attendee's name, age, school year and phone
number, so it's worth setting before the registration link goes out widely.

```
ADMIN_PASSWORD=<what staff type to sign in>
ADMIN_SESSION_SECRET=<long random string, e.g. `openssl rand -hex 32`>
```

`ADMIN_SESSION_SECRET` signs the session cookie (httpOnly, 12-hour expiry),
so changing it signs everyone out. Without both variables set, the page just
shows its login screen and refuses every password.

## 9. Set env vars in Vercel

Add everything from `.env.example` (with real values) to the Vercel
project's Environment Variables, plus:

```
NEXT_PUBLIC_SITE_URL=https://finger-print.org
```

## Useful queries while testing

```bash
# See all registrations
bunx wrangler d1 execute finger-print-2026 --remote --command \
  "SELECT id, registrant_type, payer_name, payer_phone, status, total_mnt FROM registrations ORDER BY created_at DESC"

# See attendees for a registration
bunx wrangler d1 execute finger-print-2026 --remote --command \
  "SELECT * FROM attendees WHERE registration_id = '<id>'"

# See raw webhook events (useful for debugging Byl callbacks)
bunx wrangler d1 execute finger-print-2026 --remote --command \
  "SELECT * FROM payment_events ORDER BY created_at DESC LIMIT 20"
```
