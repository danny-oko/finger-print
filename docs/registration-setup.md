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
| `checkout.completed` | Registration → `paid`, QR tickets issued |
| `payment.awaiting_verification` | Stays `pending`, flagged in the admin monitor as a bank transfer a human still needs to confirm |

Byl expects a `2xx` within 5 seconds and retries with exponential backoff
otherwise, so the webhook route logs and acknowledges rather than letting a
slow write turn into a retry loop.

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

## 5b. Retire the age and parent-phone columns on an existing database

Skip this if you just created the database in step 1. The registration form
no longer asks for age (grade already carries it) or for a parent's phone
number, so `attendees.age` and `attendees.parent_phone` have to stop being
`NOT NULL` before the app can insert a row without them:

```bash
bunx wrangler d1 execute finger-print-2026 --remote \
  --file=./db/migrations/0004_retire_attendee_age_and_parent_phone.sql
```

Both columns are kept rather than dropped, so what was collected before the
change is still there and the status lookup still matches on `parent_phone`
for those older rows; new rows just leave both `NULL`.

## 5c. Add the attendee role column

Skip this if you just created the database in step 1. Someone can now
register as the youth leader bringing a group ("өсвөрийн ахлагч") instead of
picking a school year, which needs a `role` column and a nullable `grade`:

```bash
bunx wrangler d1 execute finger-print-2026 --remote \
  --file=./db/migrations/0005_add_attendee_role.sql
```

Existing rows all predate the choice, so they become `student`. This
migration rebuilds the table with the relaxed columns either way, so it's
safe to run whether or not 0004 has been applied.

## 6. Set the real registration price

The price and tax rate are stored in D1, not hardcoded, so they can be
updated anytime without a redeploy:

```bash
bunx wrangler d1 execute finger-print-2026 --remote --command \
  "UPDATE settings SET value = '20000' WHERE key = 'price_per_attendee_mnt'"

bunx wrangler d1 execute finger-print-2026 --remote --command \
  "UPDATE settings SET value = '10' WHERE key = 'tax_rate_percent'"
```

## 7. Set up the admin monitor

`/admin/registration-monitor` is the staff dashboard for watching
registrations come in.

The login is **opt-in**. With `ADMIN_PASSWORD` unset the dashboard is open to
anyone who knows the URL, and shows a warning banner saying so. Setting the
variable turns the login on — no code change, no redeploy of anything but the
env. There are no per-user admin accounts; the dashboard is read-only and the
team is small, so one shared password is the right amount of machinery.

Leaving it open publishes every attendee's name, school year and phone
number, so it's worth setting before the registration link goes out widely.

```
ADMIN_PASSWORD=<what staff type to sign in>
ADMIN_SESSION_SECRET=<long random string, e.g. `openssl rand -hex 32`>
```

`ADMIN_SESSION_SECRET` signs the session cookie (httpOnly, 12-hour expiry),
so changing it signs everyone out. Without both variables set, the page just
shows its login screen and refuses every password.

## 7b. The door check-in scanner

`/admin/check-in` is what staff run on their own phones at the door. It needs
no extra configuration — it shares the monitor's session, so signing in once
covers both pages, and it writes to the same `attendees.checked_in_at` column
the monitor already reports on.

Two things are worth knowing before the day:

- **The page must be served over https.** Browsers only hand out a camera on
  a secure origin, so the Vercel URL works and a `bun dev` server opened from
  a phone by LAN IP does not. The page says so rather than showing a dead
  black rectangle, and offers manual code entry as a way through.
- **Ask staff to open it once before the doors open.** The first visit is
  what triggers the camera permission prompt, and that is not a conversation
  worth having with a queue waiting.

Every scan lands on one of five answers, each with its own colour, vibration
and beep so staff can work without watching the screen:

| Answer | Means |
| --- | --- |
| Ирсэн бүртгэл хийгдлээ | Checked in just now — let them in |
| Өмнө нь бүртгэгдсэн | This ticket already came through, with the time it did |
| Төлбөр төлөгдөөгүй | Send them to the registration desk |
| Тасалбар олдсонгүй | The code is well-formed but belongs to no one |
| QR танигдсангүй | Nothing readable — rescan, or type the code |

A scan never overwrites an earlier arrival time, so the same ticket used
twice reads as exactly that rather than being quietly re-stamped. Anything
scanned by mistake can be undone from the result card or from the "Сүүлд
орсон" list, which shows arrivals from every phone on the door — not just
the one holding it.

## 8. Set env vars in Vercel

Add everything from `.env.example` (with real values) to the Vercel
project's Environment Variables, plus:

```
NEXT_PUBLIC_SITE_URL=https://finger-print.org
```

## 9. Web Analytics custom events

Page views work as soon as Web Analytics is enabled on the project. The
custom events below additionally need a plan that includes **Custom Events** —
without it the calls are simply ignored, nothing breaks.

Every event this app sends is declared in `lib/analytics/events.ts`, which is
the one file to read (or change) to know what leaves the site. None of them
carry a name, phone number, email or church — this app handles minors' data,
so only counts, enum values and field *names* are ever sent.

| Event | Sent from | Answers |
| --- | --- | --- |
| `registration_started` | browser, first keystroke | How many people who open the form actually start it |
| `registration_person_added` | browser | How often a registration is for a group, and how big |
| `registration_draft_restored` | browser | Whether the saved draft is earning its keep |
| `registration_invalid` | browser | **Which field blocks a submit** — the topmost failing one |
| `registration_submitted` | browser | Intent, before the redirect to Byl |
| `registration_created` | `POST /api/registration` | Row + checkout both exist (the reliable funnel top) |
| `registration_create_failed` | `POST /api/registration` | Split by `database_error` / `payment_error` |
| `registration_awaiting_verification` | Byl webhook | Bank transfers waiting on a human |
| `registration_paid` | Byl webhook | Actual conversions |

The funnel to watch is
`view → started → submitted → created → paid`, with `registration_invalid`
explaining the drop between *submitted* and *created*.

Revenue is deliberately **not** sourced from here — the admin monitor reads
it straight from D1, which is authoritative. `totalMnt` rides along on the
payment events only for segmenting.

Server-side events go out through `waitUntil()`, so they never add latency to
the Byl webhook's 5-second budget, and `trackServerEvent` swallows every
failure: losing a metric must never turn a payment into a retry. On a
deployment-protected preview these calls get a `401` unless the project has a
[Protection Bypass for Automation](https://vercel.com/docs/deployment-protection/methods-to-bypass-deployment-protection/protection-bypass-automation)
secret set — expected, and harmless.

To see them: **Vercel dashboard → the project → Analytics → Events**.

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
