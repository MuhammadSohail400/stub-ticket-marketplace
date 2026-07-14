const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const { errorHandler, notFound } = require("./middleware/errorHandler");

const app = express();

// Concept: middleware runs in order, top to bottom, for every request.
// cors() -> allow our Next.js frontend (different origin/port) to call this API
// express.json() -> parse incoming JSON request bodies into req.body
// morgan("dev") -> log each request to the terminal, useful while learning

app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(express.json());
app.use(morgan("dev"));

// Health check route — confirms the server + env are wired correctly.
// This is the very first thing we test in Phase B1.
app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "Stub API is running",
    timestamp: new Date().toISOString(),
  });
});

// Future phases will mount real routers here, e.g.:
// app.use("/api/auth", require("./routes/authRoutes"));
// app.use("/api/events", require("./routes/eventRoutes"));

app.use(notFound);
app.use(errorHandler);

module.exports = app;
