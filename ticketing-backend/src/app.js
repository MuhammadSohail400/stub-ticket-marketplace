const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const { errorHandler, notFound } = require("./middleware/errorHandler");

// Primary Express application for the ticketing backend.
// Handles middleware registration, CORS configuration, request parsing,
// logging, route wiring, and centralized error handling.
const app = express();

app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
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

// Fallback handlers for 404 and centralized error formatting.
app.use(notFound);
app.use(errorHandler);

module.exports = app;
