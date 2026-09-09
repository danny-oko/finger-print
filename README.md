# Finger Print

Website for **Finger Print**, a Mongolian Christian youth/teenagers conference — built with [Next.js](https://nextjs.org) (App Router) and deployed on Vercel.

## Tech stack

- **Next.js 16** (App Router, React 19) + **TypeScript**
- **Tailwind CSS 4** + **shadcn/ui** (`new-york` style) for UI primitives
- **react-hook-form** + **zod** for form state/validation
- **Cloudflare D1** (accessed over its REST API, not a native binding — the app runs on Vercel) for registration data
- **Byl** (`byl.mn`) for payment/checkout
- **Bun** as the package manager and dev runtime

## Project structure

```
app/
  page.tsx, sections/          Marketing site (hero, timeline, gallery, ...)
  event/registration/          Conference registration form + thank-you page
  event/status/                Look up a registration by phone number
  admin/registration-monitor/  Staff dashboard for monitoring registrations
  admin/check-in/              QR door scanner for marking attendees as arrived
  api/registration/            Registration, pricing, churches, lookup, Byl webhook
  api/admin/                   Admin session, monitor data, door check-in
components/
  registration/                Registration form steps, stepper, church combobox
  admin/                       Monitor views and filters, door scanner
  ui/                          shadcn/ui components
lib/
  d1.ts, byl.ts                Cloudflare D1 and Byl API clients
  registration/                Shared zod schema + pricing helpers
  admin/                       Admin auth, monitor grouping/sorting, check-in
db/schema.sql                  D1 table definitions
db/migrations/                 Incremental schema changes for live databases
docs/registration-setup.md     One-time Cloudflare/Byl/admin setup steps
```

## Getting started

```bash
bun install
cp .env.example .env.local   # fill in real values, see below
bun dev
```

Open [http://localhost:3000](http://localhost:3000). The marketing site works out of the box; the registration flow needs env vars (next section) to fully function.

## Environment variables

See [`.env.example`](.env.example) for the full list (Cloudflare D1 credentials, Byl API keys, Gmail SMTP, admin password, site URL). Every value is a placeholder — fill in your own before the registration flow or the admin dashboard will work.

**Do not commit `.env.local`.** It's meant to hold your real values locally; only `.env.example` (with placeholder/sandbox values) should be tracked in git.

## Registration & payments

`/event/registration` is a multi-step form supporting two flows — an individual teen registering themselves, or a church leader (*ахлагч*) registering a group in one payment — followed by a Byl-hosted checkout. `/event/status` lets a registrant look up their registration and payment status by phone number.

Payment confirmation arrives asynchronously as a `checkout.completed` webhook at `/api/registration/byl-webhook`, which is what marks a registration paid and emails each attendee's QR ticket. Every delivery is verified against the `Byl-Signature` HMAC before it's trusted.

Registration data lives in Cloudflare D1; pricing (price per attendee, tax rate) is stored in D1's `settings` table so it can be changed without a redeploy. See [`docs/registration-setup.md`](docs/registration-setup.md) for creating the D1 database, applying the schema, and getting Byl credentials.

## Admin registration monitor

`/admin/registration-monitor` is the staff dashboard, behind a single shared password (`ADMIN_PASSWORD`). It's built mobile-first — sortable cards on a phone, a sortable table on a laptop — and refreshes itself every minute.

The two registration paths converge into one dataset: each attendee is a single row carrying the registration that paid for them, so someone who signed up alone and someone entered by their *ахлагч* sort, filter and group identically. Three views read that same data differently:

- **Хүмүүс** — every attendee, sortable by name, church, grade, age, status, path, payer, ticket code or date
- **Сүмээр** — attendees folded into one card per church regardless of how they registered, with per-church paid/unpaid counts, the leaders who registered on their behalf, and revenue
- **Төлбөрөөр** — one card per payment, expandable to the attendees it covers

Church grouping runs on the normalized name from [`lib/registration/churchName.ts`](lib/registration/churchName.ts), so case, punctuation and Cyrillic/Latin spellings of the same church fold together automatically. Names that are merely *close* (a likely typo) are surfaced as a suggestion the admin can merge with one tap — a view-only merge that never rewrites stored data.

Everything above is filterable by status, registration path, church, grade, attendance and a free-text search across names, phones, emails and ticket codes, and the filtered set exports to CSV.

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

Camera access needs an https origin, so the deployed URL works and a LAN-IP
dev server does not — the page says so and offers manual code entry, using the
same ambiguity-free alphabet the codes are minted from.

## Scripts

```bash
bun dev      # start the dev server
bun run build
bun start    # serve a production build
bun run lint
```

## Deployment

Deployed on [Vercel](https://vercel.com). Set all variables from `.env.example` (with real values) in the Vercel project's environment variables before deploying.
