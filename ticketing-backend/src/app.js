const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");

const { errorHandler, notFound } = require("./middleware/errorHandler");
const { generalLimiter } = require("./middleware/rateLimiter");
const { handleStripeWebhook } = require("./controllers/orderController");

// Primary Express application for the ticketing backend.
// Handles middleware registration, CORS configuration, request parsing,
// logging, route wiring, and centralized error handling.
const app = express();

// Security headers — must be first to apply to every response.
app.use(helmet());

app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));

// IMPORTANT — this must be registered BEFORE app.use(express.json()).
// Stripe's webhook signature verification needs the RAW, unparsed
// request body bytes. If express.json() ran first (as a global
// middleware, it runs for every route, including this one), it would
// already have consumed the request stream and turned it into a JS
// object — by the time our webhook route saw it, the raw bytes needed
// for signature verification would be gone. Registering this route
// with express.raw() ahead of the global json() middleware, and on this
// exact path only, is what makes stripe.webhooks.constructEvent() work.
app.post(
  "/api/orders/webhook",
  express.raw({ type: "application/json" }),
  handleStripeWebhook
);

app.use(express.json());

// Strip any keys containing `$` or `.` from req.body, req.query, and
// req.params to block NoSQL injection attempts.
//
// NOTE: express-mongo-sanitize's built-in middleware does `req.query = <sanitized>`
// internally. In Express 5, `req.query` is a getter-only accessor defined on the
// request prototype (see express/lib/request.js) with no setter, so that plain
// assignment throws:
//   "Cannot set property query of #<IncomingMessage> which has only a getter"
// Also, that getter re-parses the query string from req.url on *every* access
// (it isn't cached), so simply sanitizing the object in place isn't enough either —
// any later `req.query` read would just re-parse the original, unsanitized string.
// The fix: read req.query once, sanitize that snapshot, then shadow the prototype
// getter with an own, writable data property on this request instance via
// Object.defineProperty (the prototype getter is `configurable: true`, so this is
// allowed) — that's what express-mongo-sanitize itself relies on for Express 4 and
// what we have to do explicitly here for Express 5.
app.use((req, res, next) => {
  if (req.body) mongoSanitize.sanitize(req.body);
  if (req.params) mongoSanitize.sanitize(req.params);
  if (req.query) {
    const sanitizedQuery = mongoSanitize.sanitize({ ...req.query });
    Object.defineProperty(req, "query", {
      value: sanitizedQuery,
      writable: true,
      configurable: true,
      enumerable: true,
    });
  }
  next();
});

app.use(morgan("dev"));

// General rate limiter: 100 requests per 15 minutes per IP across all routes.
// Auth and validate endpoints apply stricter limiters at the route level.
app.use(generalLimiter);

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "Stub API is running",
    timestamp: new Date().toISOString(),
  });
});

// Route registration for core API resources.
// Each route module encapsulates controller logic and middleware.
app.use("/api/auth", require("./routes/authRoute"));
app.use("/api/events", require("./routes/eventRoutes"));
app.use("/api/listings", require("./routes/listingRoutes"));
app.use("/api/orders", require("./routes/orderRoutes"));
app.use("/api/transfers", require("./routes/transferRoutes"));

// Fallback handlers for 404 and centralized error formatting.
app.use(notFound);
app.use(errorHandler);

module.exports = app;