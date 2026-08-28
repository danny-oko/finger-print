# Finger Print

Website for **Finger Print**, a Mongolian Christian youth/teenagers conference — built with [Next.js](https://nextjs.org) (App Router) and deployed on Vercel.

## Tech stack

- **Next.js 16** (App Router, React 19) + **TypeScript**
- **Tailwind CSS 4** + **shadcn/ui** (`new-york` style) for UI primitives
- **react-hook-form** + **zod** for form state/validation
- **Cloudflare D1** (accessed over its REST API, not a native binding — the app runs on Vercel) for registration data
- **Bonum** (`psp.bonum.mn`) for payment/checkout
- **Bun** as the package manager and dev runtime

## Project structure

```
app/
  page.tsx, sections/          Marketing site (hero, timeline, gallery, ...)
  event/registration/          Conference registration form + thank-you page
  event/status/                Look up a registration by phone number
  api/registration/            Registration, pricing, churches, lookup, Bonum webhook
components/
  registration/                Registration form steps, stepper, church combobox
  ui/                          shadcn/ui components
lib/
  d1.ts, bonum.ts              Cloudflare D1 and Bonum API clients
  registration/                Shared zod schema + pricing helpers
db/schema.sql                  D1 table definitions
docs/registration-setup.md     One-time Cloudflare/Bonum setup steps
```

## Getting started

```bash
bun install
cp .env.example .env.local   # fill in real values, see below
bun dev
```

Open [http://localhost:3000](http://localhost:3000). The marketing site works out of the box; the registration flow needs env vars (next section) to fully function.

## Environment variables

See [`.env.example`](.env.example) for the full list (Cloudflare D1 credentials, Bonum API keys, site URL). `.env.example` ships Bonum's public **sandbox** credentials so local dev works immediately — replace them, and provide your own Cloudflare D1 credentials, before going to production.

**Do not commit `.env.local`.** It's meant to hold your real values locally; only `.env.example` (with placeholder/sandbox values) should be tracked in git.

## Registration & payments

`/event/registration` is a multi-step form supporting two flows — an individual teen registering themselves, or a church leader registering a group in one payment — followed by a Bonum-hosted checkout. `/event/status` lets a registrant look up their registration and payment status by phone number.

Registration data lives in Cloudflare D1; pricing (price per attendee, tax rate) is stored in D1's `settings` table so it can be changed without a redeploy. See [`docs/registration-setup.md`](docs/registration-setup.md) for creating the D1 database, applying the schema, and getting production Bonum credentials.

## Scripts

```bash
bun dev      # start the dev server
bun run build
bun start    # serve a production build
bun run lint
```

## Deployment

Deployed on [Vercel](https://vercel.com). Set all variables from `.env.example` (with real values) in the Vercel project's environment variables before deploying.
