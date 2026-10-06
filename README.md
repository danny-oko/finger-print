# Finger Print

Website for **Finger Print**, a Mongolian Christian youth/teenagers conference — built with [Next.js](https://nextjs.org) (App Router) and deployed on Vercel.

## Tech stack

- **Next.js 16** (App Router, React 19) + **TypeScript**
- **Tailwind CSS 4** + **shadcn/ui** (`new-york` style) for UI primitives
- **react-hook-form** + **zod** for form state/validation
- **Cloudflare D1** (accessed over its REST API, not a native binding — the app runs on Vercel) for registration data
- **Upstash Redis** (optional, strongly recommended) for the waiting room and rate limits
- **Byl** (`byl.mn`) for payment/checkout
- **Vitest** for unit tests
- **Bun** as the package manager and dev runtime

## Project structure

```
app/
  page.tsx, sections/          Marketing site (hero, timeline, gallery, ...)
  come/                        Invitation page friends send each other
  event/registration/          Registration form, and /<id> — status + tickets
  event/status/                Find a registration by phone number
  event/ticket/[code]/         One attendee's ticket
  invited/[token]/             Free registration via the private invite link
  admin/registration-monitor/  Staff dashboard (+ registration switches)
  admin/check-in/              Door scanner
  api/                         Route handlers — thin: parse, authorise, call lib/
components/
  event/                       Shared shell for the public event pages
  registration/  come/         Form, review, waiting-room UI, invite page
  admin/                       Monitor views, controls, door scanner
  ui/                          shadcn/ui primitives
lib/
  db/d1.ts                     The one D1 client: batching, retries, rate-limit backoff
  kv.ts                        Redis (Upstash REST) / in-memory key-value store
  cache.ts                     Per-instance TTL cache with single-flight loads
  queue/                       Waiting room: admission algorithm + signed tickets/passes
  server/                      Rate limiting, concurrency limiter
  registration/                Domain logic: create, settings, availability, lookup, tickets
  admin/                       Admin auth, monitor grouping, check-in types
  i18n/                        Language detection + server helper
  event.ts                     Date, time, audience — stated once for every page
db/schema.sql, db/migrations/  D1 schema and incremental migrations
scripts/local-stack/           Fake D1 + fake Byl for running everything offline
tests/                         Vitest unit tests
```

## Getting started

```bash
bun install
cp .env.example .env.local   # fill in real values, see below
bun dev
```

Open [http://localhost:3000](http://localhost:3000). The marketing site works out of the box; the registration flow needs env vars (next section) to fully function.

## Environment variables

See [`.env.example`](.env.example) for the full list (Cloudflare D1 credentials, Byl API keys, Upstash Redis, admin password, invite token, site URL). Every value is a placeholder — fill in your own before the registration flow or the admin dashboard will work.

**Do not commit `.env.local`.** It's meant to hold your real values locally; only `.env.example` (with placeholder/sandbox values) should be tracked in git.

## Handling a rush

Registration opening is a spike: hundreds of people on the form in the same
few minutes. The limit that runs out first is not the server — Vercel scales —
but **Cloudflare's API rate limit: 1,200 requests per 5 minutes for the whole
account**, which every D1 query counts against. Past it, Cloudflare blocks
*all* API calls for five minutes. Everything below exists to stay under it.

- **Fewer requests per registration.** Creating one is a single D1 batch (one
  HTTP request) that runs as a transaction. The duplicate-phone rule, the
  seat limit and idempotency are conditions *inside* the INSERT, so two
  people racing for the last seat can't both win. A full paid registration —
  create, payment webhook, ticket page — costs about 14 requests end to end.
- **Cached reads.** The form loads one `/api/registration/bootstrap`
  response (price, seats, churches, queue on/off) that the CDN shares for 5
  seconds; settings and the church list are cached per instance with
  single-flight loads. The ticket page's polling backs off and stops in a
  background tab, and only asks Byl directly after the webhook has had 30s.
- **Waiting room.** Pressing "pay" first takes a place in line
  (`lib/queue/waitingRoom.ts`). A token bucket lets `burst` people straight
  through, then `admitPerMinute` more per minute — set from the admin
  monitor, default 20/min, which keeps ~14 requests × 20 under the budget
  with room for staff dashboards. People waiting see how many are ahead and
  an ETA; people who close the tab drop out after 90s, and a phone that slept
  rejoins at its old place (the ticket is signed and carries its number). An
  admission is a signed pass, checked statelessly and bound to one
  submission. When the line is empty nobody sees any of this.
- **Idempotency.** Every submission carries a key, so a double tap, a retry
  after a timeout or a second tab returns the registration that already
  exists instead of making an unpaid duplicate.
- **Backoff and load shedding.** The D1 client caps concurrent calls per
  instance, honours `Retry-After` on a 429, and for a few seconds afterwards
  the as-you-type phone check stands down so the budget goes to saving
  registrations.
- **Staff screens are budgeted too.** The monitor's check of pending
  payments against Byl runs at most once every 2 minutes across all open
  dashboards, in the background, over the 30 most recent; each door scan is a
  single request.
- **Rate limits per IP** on lookup, phone check, registration, church
  creation, queue joins and the admin login (set to stop scripts, not a
  church group sharing one Wi-Fi).

The waiting room and rate limits need a shared store: add **Upstash Redis**
from the Vercel Marketplace (it sets `KV_REST_API_URL` / `KV_REST_API_TOKEN`).
Without it the waiting room is off in production and rate limits are
per-instance — registration still works, it just isn't protected. If Redis
is ever unreachable, both fail open rather than block registration.

## Registration & payments

`/event/registration` asks first whether you're registering **yourself** or **a group** (a youth leader or parent paying once for several people), then the church, then the people — with the running total always above the pay button. A review dialog shows everything before the Byl-hosted checkout; if the waiting room is holding people, that dialog becomes their place in line. `/event/status` lets a registrant look up their registration and payment status by phone number.

Payment confirmation arrives asynchronously as a `checkout.completed` webhook at `/api/registration/byl-webhook`, which is what marks a registration paid and emails each attendee's QR ticket. Every delivery is verified against the `Byl-Signature` HMAC before it's trusted.

Registration data lives in Cloudflare D1; pricing (price per attendee, tax rate) is stored in D1's `settings` table so it can be changed without a redeploy. See [`docs/registration-setup.md`](docs/registration-setup.md) for creating the D1 database, applying the schema, and getting Byl credentials.

## Admin registration monitor

`/admin/registration-monitor` is the staff dashboard, behind a single shared password (`ADMIN_PASSWORD`, rate-limited against guessing). Its **Бүртгэлийн тохиргоо** panel opens, pauses or closes registration, sets a seat limit (unpaid registrations hold seats for 45 minutes, invoices for 24 hours), and tunes or switches off the waiting room — changes reach every server within ~15 seconds. It's built mobile-first — sortable cards on a phone, a sortable table on a laptop — and refreshes itself every minute.

The two registration paths converge into one dataset: each attendee is a single row carrying the registration that paid for them, so someone who signed up alone and someone entered by their *ахлагч* sort, filter and group identically. Three views read that same data differently:

- **Хүмүүс** — every attendee, sortable by name, church, grade, age, status, path, payer, ticket code or date
- **Сүмээр** — attendees folded into one card per church regardless of how they registered, with per-church paid/unpaid counts, the leaders who registered on their behalf, and revenue
- **Төлбөрөөр** — one card per payment, expandable to the attendees it covers

Church grouping runs on the normalized name from [`lib/registration/churchName.ts`](lib/registration/churchName.ts), so case, punctuation and Cyrillic/Latin spellings of the same church fold together automatically. Names that are merely *close* (a likely typo) are surfaced as a suggestion the admin can merge with one tap — a view-only merge that never rewrites stored data.

Everything above is filterable by status, registration path, church, grade, attendance and a free-text search across names, phones, emails and ticket codes, and the filtered set exports to CSV.

## Invite link

`/invited/<token>` is a private registration page for invited guests, handed out as a printed QR code. Each scan registers one person for free — church, name, phone, school year — and issues their ticket immediately, skipping Byl. They find it again the same way as everyone else: `/event/registration/<id>` or the `/event/status` phone lookup.

The token is the `INVITE_TOKEN` env var (`openssl rand -hex 12`), never committed. Unset, the page 404s; changing it invalidates every QR already printed. Invited registrations are stored as paid with a zero total and `source = 'invite'`, and the admin monitor labels them **Урилгатай**, counts them as attendees but not revenue, and allows deleting them. See step 7c of [`docs/registration-setup.md`](docs/registration-setup.md). Migration 0006 (step 5d) must be applied **before** deploying this code — the monitor, registration, ticket and status-lookup reads all select `r.source`.

## Share previews

The site is shared mostly by pasting the link into Messenger and group chats,
so the link preview is the first thing most people see of it. Both the card
image and its metadata are generated server-side:

- [`app/opengraph-image.tsx`](app/opengraph-image.tsx) and
  [`app/event/registration/opengraph-image.tsx`](app/event/registration/opengraph-image.tsx)
  render a 1200x630 card with `next/og`, sharing one design in
  [`lib/og/card.tsx`](lib/og/card.tsx). The ticket price on the card is read
  from D1, so it follows the `settings` table rather than a number baked in at
  deploy time; the route revalidates hourly, so that costs ~24 reads a day.
- Fonts are bundled in `assets/` rather than fetched. `next/og`'s built-in
  font has no bold weight and no tugrik sign, so `₮` rendered as an empty box
  and `fontWeight: 800` did nothing until they were added.
- `metadataBase` in [`app/layout.tsx`](app/layout.tsx) is what makes
  `og:image` absolute. Without it chat apps silently drop the image and fall
  back to scraping something off the page.
- The language redirect in [`proxy.ts`](proxy.ts) skips `opengraph-image`
  routes, so a crawler fetching the PNG isn't bounced through a 307 first.

## Door check-in

`/admin/check-in` is the scanner staff run on their phones at the door, behind
the same session as the monitor. It reads a ticket's QR through the camera and
marks that attendee as arrived on the spot — no confirm step, since the person
is already standing there.

Decoding uses the browser's native `BarcodeDetector` where it exists and falls
back to [jsQR](https://github.com/cozmo/jsQR) everywhere else, which is what
makes it work on the iPhones half the team will be holding. Each scan answers
with a colour, a vibration and a beep so staff can watch the door instead of
the screen: checked in, already came through (with the time), payment not
settled, unknown code, or unreadable. A repeat scan never overwrites the first
arrival time, and a mis-scan can be undone from the result card or from the
shared list of recent arrivals.

Anyone without a scannable ticket — a dead phone, a leader holding twenty
tickets — is found on the **Хайх** tab by name, phone or the printed code and
checked in by hand. If the venue Wi-Fi drops, scans are kept on the phone and
sent as soon as the connection returns; any that turn out to be bad are
flagged at the top of the screen. Each scan is one D1 request.

Camera access needs an https origin, so the deployed URL works and a LAN-IP
dev server does not — the page says so and offers manual code entry, using the
same ambiguity-free alphabet the codes are minted from.

## Language

The marketing site is in Mongolian, English and Korean. The choice lives in
the `fp_lang` cookie and is resolved on the server (`lib/i18n`), so the first
paint is already in the right language and URLs stay clean. A first visit
uses the browser's language, then the visitor's country, then Mongolian. Old
`?lang=xx` links still work: they set the cookie and redirect to the clean
URL. The registration, invite and admin pages are Mongolian-only.

## Running everything locally

`scripts/local-stack` has stand-ins for D1 (backed by `node:sqlite`, with
real transactions) and Byl (with a pay page that sends the signed webhook),
so the full flow — queue, registration, payment, tickets, door scan — runs
without touching production:

```bash
bun run local:d1      # fake D1 on :8787, data in .local/
bun run local:byl     # fake Byl on :8788
bun run dev:local     # Next.js pointed at both
```

Set `FAKE_D1_BUDGET=5` on `local:d1` to rehearse Cloudflare's rate limit.

## Scripts

```bash
bun dev          # start the dev server
bun run build
bun start        # serve a production build
bun run lint
bun run typecheck
bun run test     # vitest — includes the Redis Lua script via ioredis-mock
```

## Deployment

Deployed on [Vercel](https://vercel.com). Set all variables from `.env.example` (with real values) in the Vercel project's environment variables before deploying.

Before registration opens:

1. Apply `db/migrations/0007_registration_capacity_and_idempotency.sql` (step 5e of the setup doc) **before** deploying this code — registration writes its new columns.
2. Add Upstash Redis from the Vercel Marketplace, and set `QUEUE_SECRET`.
3. Consider pinning the Vercel function region to `fra1`: the D1 primary is in Frankfurt, and every request makes at least one round trip to it.
