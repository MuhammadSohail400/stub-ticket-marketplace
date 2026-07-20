---

## Phase B1 — Server + Database (completed)

- Express server (`server.js`) that connects to MongoDB *before* it
  starts listening, avoiding a race condition where requests could
  arrive before the DB connection is ready.
- Central error handler (`errorHandler.js`) so controllers don't repeat
  error-response formatting.
- One test route: `GET /api/health`.

Concepts: MVC-style separation (config / middleware / app kept in
separate files), loading secrets from `.env`, centralized error handling.

---

## Phase B2 — Auth (completed)

- `POST /api/auth/signup` — creates an account, returns a JWT.
  `role` is optional and restricted to a whitelist (`buyer` or
  `seller`) — `admin` can never be self-assigned at signup; it must be
  granted separately by an existing admin.
- `POST /api/auth/login` — verifies credentials, returns a JWT.
- `GET /api/auth/me` — protected, returns the logged-in user's own data.

Concepts:
- Password hashing via a Mongoose `pre('save')` hook on the `User`
  model — hashing lives on the model, not the controller, so it's
  guaranteed to run no matter where a user gets created/updated.
- JWT structure (`header.payload.signature`) — encoded, not encrypted;
  never put sensitive data in the payload (we only store `user._id`).
- `protect` middleware — verifies the token, attaches `req.user`, and
  only calls `next()` if valid. If invalid, the controller never runs.
- `authorize(...roles)` middleware — separate from `protect`; answers
  "is this specific user allowed to do this specific action," not
  just "who are they."
- `select: false` on the password field — excluded from query results
  by default; explicitly opted back in with `.select("+password")`
  only where needed (login).

### Auth examples

```bash
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"name":"Alice","email":"alice@example.com","password":"password123","role":"seller"}'
```

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"alice@example.com","password":"password123"}'
```

```bash
curl http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer <jwt-token>"
```

---

## Phase B3 — Events (completed)

- `GET /api/events` — public, list all events. Supports `?city=` and
  `?category=` query filters (case-insensitive, matched at the
  database level, not filtered in JS after fetching everything).
- `GET /api/events/:id` — public, single event detail.
- `POST /api/events` — protected, create an event.
- `PATCH /api/events/:id` — protected, only the event's creator (or an
  admin) can update.
- `DELETE /api/events/:id` — protected, only the event's creator (or an
  admin) can delete.

Concepts: REST conventions (GET/POST/PATCH/DELETE), Mongoose relations
(`ref` + `.populate()`), and — the most important lesson from this
phase — **ownership authorization must be checked *before* the write
operation, never after.** (An earlier draft checked authorization after
calling `findByIdAndDelete`, meaning the delete had already happened by
the time the 403 was returned.)

### Events examples

```bash
curl "http://localhost:5000/api/events?city=Karachi&category=concert"
```

```bash
curl -X POST http://localhost:5000/api/events \
  -H "Authorization: Bearer <jwt-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "My Concert",
    "description": "An evening of music",
    "category": "concert",
    "venue": "Hall 1",
    "city": "Karachi",
    "eventDate": "2026-08-01T19:00:00.000Z",
    "bannerImage": "https://example.com/banner.jpg"
  }'
```

Note: `bannerImage` is a URL string, not a file upload, in the current
implementation. File upload support (multer/Cloudinary) may be added in
a later phase.

```bash
curl -X PATCH http://localhost:5000/api/events/<eventId> \
  -H "Authorization: Bearer <jwt-token>" \
  -H "Content-Type: application/json" \
  -d '{"title": "Updated Title", ...same shape as create...}'
```

```bash
curl -X DELETE http://localhost:5000/api/events/<eventId> \
  -H "Authorization: Bearer <jwt-token>"
```

---

## Phase B4 — Ticket Listings (completed)

- `GET /api/listings` — public, list all listings. Supports
  `?eventId=` filter.
- `GET /api/listings/:id` — public, single listing detail.
- `POST /api/listings` — protected, restricted to `seller` or `admin`
  roles via the `authorize` middleware. Validates the referenced event
  actually exists before creating an orphan listing.
- `PUT /api/listings/:id` — protected, only the listing's seller (or
  admin). Only allowed while `status === "listed"` — can't edit a
  listing that's already reserved/sold, since a buyer may already be
  mid-transaction.
- `DELETE /api/listings/:id` — protected, only the listing's seller (or
  admin).

Concepts: role-based route protection (`authorize("seller", "admin")`),
cross-model existence validation, status-gated operations (an early
taste of the state-machine thinking that Orders formalize fully).

---

## Phase B5 — Orders (completed)

- `POST /api/orders` — protected, buyer creates an order for a listing.
  - Rejects if the listing isn't `status: "listed"`.
  - Rejects if the buyer is the listing's own seller.
  - Snapshots `amount` / `platformFee` at the moment of purchase (so
    the order's recorded price never changes even if the listing's
    price is edited later).
  - Side-effect: flips the listing's status to `"reserved"` so it
    can't be sold twice.
- `GET /api/orders/mine` — protected, all orders where the logged-in
  user is either the buyer or the seller.
- `GET /api/orders/:id` — protected, only the buyer, seller, or an
  admin on that specific order can view it.
- `PATCH /api/orders/:id/status` — protected, moves an order through
  its state machine. Only the seller can trigger `transferred`; only
  the buyer can trigger `completed`.

### Order state machine

pending → paid → transferred → completed
↓        ↓          ↓
cancelled refunded   disputed → completed / refunded
- `completed`, `cancelled`, and `refunded` are terminal — no further
  transitions are allowed once reached.
- All transitions are validated by `order.transitionTo(nextStatus)`, an
  instance method on the `Order` model, checked against a whitelist
  table in `src/utils/orderStateMachine.js`. Controllers never set
  `order.status` directly — every status change goes through this
  method, so the rule can't be bypassed by a future route that forgets
  to check.
- The model method is intentionally framework-agnostic: it throws a
  plain `Error` and knows nothing about `res.status()`. Translating
  that into an HTTP status code is the controller's job.
- **Separation of concerns:** "is this transition valid at all" lives
  in the model (state machine); "is *this specific user* allowed to
  trigger *this specific* transition" lives in the controller (e.g.
  only a seller can mark `transferred`, only a buyer can mark
  `completed`) — these are different questions answered in different
  layers.

### Order examples

```bash
curl -X POST http://localhost:5000/api/orders \
  -H "Authorization: Bearer <buyer-jwt-token>" \
  -H "Content-Type: application/json" \
  -d '{"ticketListingId": "<listingId>"}'
```

```bash
curl http://localhost:5000/api/orders/mine \
  -H "Authorization: Bearer <jwt-token>"
```

```bash
curl -X PATCH http://localhost:5000/api/orders/<orderId>/status \
  -H "Authorization: Bearer <seller-jwt-token>" \
  -H "Content-Type: application/json" \
  -d '{"status": "transferred"}'
```

### Known limitation (intentional — addressed in Phase B8)

The "is this listing still available" check in `createOrder` is not
yet race-condition-safe: two simultaneous requests could both pass the
availability check before either one writes. This will be fixed with
an atomic `findOneAndUpdate` (or a proper MongoDB transaction/session)
when concurrency control is covered.

---

## What comes next

- **Phase B6** — Stripe integration (test mode): wire real payment
  intents into the `pending → paid` transition, and a webhook to
  confirm payment asynchronously.
- **Phase B7** — Escrow release + TicketTransfer model + QR code
  generation/validation.
- **Phase B8** — Concurrency control: atomic operations / transactions
  to close the race-condition gap noted above.
- **Phase B9** — Connect the Next.js frontend to this real backend,
  replacing `lib/mockData.ts`.

## Testing

All endpoints have been manually tested via Postman/Thunder Client,
covering both the happy path and negative cases (missing auth, wrong
role, wrong owner, invalid state transitions, non-existent resources).
Compass (MongoDB GUI) was used alongside testing to visually confirm
documents, relations, and status changes in the database.
Koi masla nahi — bas ek aur chhota commit kar denge README ke liye, alag commit hona bhi normal hai (history mein clean rehta hai "docs update" alag se dikhna).

README mein add karo (ticketing-backend/README.md ke end mein, "Next: Phase B6" wale section ko replace karke)
markdown

## Phase B6 — Stripe Payment Integration (completed)

- `POST /api/orders` now also creates a Stripe Payment Intent for the
  order's total (`amount + platformFee`), stores its ID on the order
  (`stripePaymentIntentId`), and returns a `clientSecret` in the
  response for the frontend to use with Stripe.js/Elements.
- `POST /api/orders/webhook` — receives Stripe's server-to-server
  confirmation that a payment succeeded, verifies the request's
  signature, and moves the matching order from `pending` to `paid` via
  `order.transitionTo()`.

Concepts:
- **Payment Intents** — a two-step payment flow (create intent on the
  server, confirm with card details on the client) instead of trusting
  a client-reported "payment successful."
- **Webhooks (inversion of control)** — instead of polling Stripe for
  status, Stripe calls our server when something happens. This is why
  the webhook route has no `protect` middleware — it's authenticated by
  Stripe's signature, not a user JWT.
- **Raw body vs. parsed JSON** — the webhook route is mounted in
  `app.js` with `express.raw()`, registered *before* the global
  `express.json()` middleware. Signature verification needs the exact
  original request bytes; once `express.json()` parses a body into a
  JS object, the raw bytes needed for the signature check are gone.
- **Idempotency** — Stripe may send the same webhook event more than
  once (retries). The handler only calls `transitionTo("paid")` if the
  order is still `pending`, so a duplicate webhook is a harmless no-op
  instead of an error.
- Amounts are converted to the smallest currency unit (paisa, not
  rupees) before being sent to Stripe.

### Testing note

Full webhook testing requires the Stripe CLI (`stripe listen --forward-to
...`) to forward events to localhost, which wasn't set up in this phase.
Instead, the `pending -> paid` transition was verified manually via
`PATCH /api/orders/:id/status`. This is fine for local development, but
in production the ONLY trusted way to mark an order "paid" is the
verified webhook — a manually-triggered PATCH bypasses payment
verification entirely and should never be relied on outside testing.

## Phase B7 — Escrow Release + TicketTransfer + QR Code (completed)

- `POST /api/transfers/:orderId` — protected, only the order's seller
  can initiate a transfer. Requires `order.status === "paid"`. Generates
  a cryptographically random token (`crypto.randomBytes`), encodes it
  as a QR code image (base64 data URL), and transitions the order
  `paid -> transferred`.
- `GET /api/transfers/:orderId` — protected, buyer, seller, or admin can
  view the transfer (to display/download the QR).
- `PATCH /api/transfers/:orderId/confirm` — protected, only the order's
  buyer can confirm receipt. This transitions the order
  `transferred -> completed` AND releases escrow
  (`escrowStatus: "held" -> "released"`).
- `POST /api/transfers/validate` — intentionally unprotected (simulates
  a gate-scanner, not a logged-in buyer/seller action). Looks up a
  transfer by its raw token and marks it `isUsed: true`. A token that's
  already been used is rejected — this is what makes a screenshot of
  the QR code useless after first scan.

Concepts:
- **QR code generation** — the QR image is just a visual encoding of a
  unique secret token; the token itself (not the image) is what's
  actually verified in the database.
- **Cryptographically secure randomness** (`crypto.randomBytes`, not
  `Math.random()`) — the token must be computationally infeasible to
  guess.
- **One-time-use tokens** (`isUsed` flag) — the same security pattern
  used by password-reset links: valid once, then permanently dead.
- **Escrow release as a specific trigger point** — money conceptually
  moves from "held" to "released" at exactly one moment: buyer
  confirmation, not seller claim. Neither party can single-handedly
  complete the transaction — the seller proves they sent it (QR
  generation), the buyer proves they received it (confirmation) —
  a mutual-trust mechanism between two parties who don't know each
  other.
- **Role-specific state transitions**, now spanning two related models
  (Order + TicketTransfer) instead of one.

## Phase B8 — Concurrency Control (completed)

- Fixed the race condition flagged back in Phase B5: `createOrder` used
  to read a listing's status, check it in JavaScript, then write a
  separate update — three steps with a gap where two simultaneous
  buyers could both pass the availability check before either write
  landed (a double-sell bug).
- Replaced this with a single atomic `TicketListing.findOneAndUpdate({
  _id, status: "listed" }, { status: "reserved" })` — MongoDB guarantees
  this check-and-write happens as one indivisible operation per
  document, so only the first of two concurrent requests can ever
  succeed.
- Added a **compensating action**: if anything fails after the listing
  is atomically reserved (Order validation, Stripe being down), the
  listing is manually reverted to `"listed"` in a catch block — without
  this, a failed order would leave a ticket permanently stuck as
  unavailable with no order attached to it.
- `scripts/testConcurrency.js` — a standalone script that fires two
  simultaneous order requests via `Promise.all()` and asserts exactly
  one succeeds, proving the fix under real concurrent load (something
  Postman can't easily simulate manually).

Concepts: atomic database operations vs. multi-step
check-then-write races, MongoDB's per-document atomicity guarantee,
compensating actions (manual rollback) as a lighter-weight alternative
to full multi-document transactions when only one collection needs to
stay consistent.

## Next: Phase B9

Connect the Next.js frontend to this real backend — replacing
`lib/mockData.ts` with real API calls (axios), wiring up NextAuth for
real login/signup, and Stripe Elements on the checkout page for actual
card payment collection.