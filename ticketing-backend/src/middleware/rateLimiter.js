const rateLimit = require("express-rate-limit");

/**
 * General limiter applied to all API routes.
 * 100 requests per 15-minute window per IP.
 */
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  standardHeaders: true, // Return rate-limit info in the `RateLimit-*` headers
  legacyHeaders: false,  // Disable the deprecated `X-RateLimit-*` headers
  message: {
    success: false,
    message: "Too many requests from this IP, please try again after 15 minutes.",
  },
});

/**
 * Strict limiter for authentication endpoints (login, signup).
 * 10 requests per 15-minute window per IP — limits brute-force attacks.
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many authentication attempts from this IP, please try again after 15 minutes.",
  },
});

/**
 * Moderate limiter for the public ticket-validation endpoint.
 * This endpoint is deliberately unauthenticated (gate-scanner use case),
 * so rate-limiting is the primary defence against token enumeration / DoS.
 * 30 requests per 15-minute window per IP.
 */
const validateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many validation requests from this IP, please try again after 15 minutes.",
  },
});

module.exports = { generalLimiter, authLimiter, validateLimiter };
