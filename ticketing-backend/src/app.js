const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const { errorHandler, notFound } = require("./middleware/errorHandler")
const { handleStripeWebhook } = require("./controllers/orderController");

// Primary Express application for the ticketing backend.
// Handles middleware registration, CORS configuration, request parsing,
// logging, route wiring, and centralized error handling.
const app = express();

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
app.use(morgan("dev"));


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
