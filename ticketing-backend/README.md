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