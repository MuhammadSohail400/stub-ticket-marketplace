# Stub — P2P Event Ticketing (Phase 1: Frontend)

Peer-to-peer ticket resale marketplace frontend. Built with Next.js 14+ (App Router)
and Tailwind CSS v4. All data currently comes from `lib/mockData.ts` — this gets
swapped for real API calls to the Express + MongoDB backend in Phase 2.

## Design direction

Ticket-stub visual identity: perforated tear-line cards, ink navy / paper white /
stamp amber palette, Space Grotesk (display) + IBM Plex Sans (body) + IBM Plex Mono
(ticket codes, labels). The signature element is the `TicketStub` component —
every listing looks like a physical torn ticket with a counterfoil price stub.

## Pages built (Phase 1)

- `/` — landing page with hero + featured events
- `/events` — browse all events
- `/events/[eventId]` — event detail + its resale listings
- `/checkout/[listingId]` — order summary (Stripe wired in Phase 3)
- `/listings/create` — seller ticket listing form
- `/dashboard/buyer` — buyer's orders
- `/dashboard/seller` — seller's listings
- `/login`, `/signup` — auth UI shells (NextAuth wired in Phase 2)

## Run locally

```bash
npm install
npm run dev
```

Open http://localhost:3000

## Deploy to Vercel

1. Push this folder to a GitHub repo:
   ```bash
   git init
   git add .
   git commit -m "feat: phase 1 frontend with mock data"
   git branch -M main
   git remote add origin <your-repo-url>
   git push -u origin main
   ```
2. Go to vercel.com -> Add New Project -> import the GitHub repo.
3. Framework preset auto-detects as Next.js — leave build settings default.
4. No environment variables needed yet (Phase 1 has no backend/API calls).
5. Deploy. You'll get a `*.vercel.app` URL; every future push to `main` auto-deploys,
   and every PR gets its own preview URL.

## Phase 2 prep (backend integration points)

Replace the functions in `lib/mockData.ts` (`getEventById`, `getListingsForEvent`,
`getListingById`) with axios calls to the Express API, using the endpoints and
schemas defined in the project documentation. Component code does not need to
change — they already consume this same shape of data.
