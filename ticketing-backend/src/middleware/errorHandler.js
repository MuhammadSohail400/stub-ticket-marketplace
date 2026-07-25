/**
 * Centralized error handling middleware.
 *
 * Intercepts errors passed via next(err) from any controller or middleware
 * and normalizes them into a consistent JSON response shape.
 *
 * Special cases handled explicitly so callers receive useful HTTP status
 * codes and clean messages instead of a generic 500:
 *
 *  - Mongoose CastError      → 400  (e.g. malformed ObjectId in route param)
 *  - Mongoose ValidationError → 400  (schema constraint violations)
 *  - MongoDB duplicate-key    → 409  (unique index violation, e.g. duplicate email)
 */
function errorHandler(err, req, res, next) {
  // --- Mongoose CastError (invalid ObjectId format) ---
  // Occurs when a route param like /:id is not a valid MongoDB ObjectId.
  // The raw Mongoose message names internal path names, so we replace it
  // with a client-safe message.
  if (err.name === "CastError") {
    return res.status(400).json({
      success: false,
      message: `Invalid value for field '${err.path}': '${err.value}' is not a valid ID.`,
    });
  }

  // --- Mongoose ValidationError (schema constraint failure) ---
  // Collect all failing field messages into a single, clean error string.
  // Mongoose puts individual field errors in err.errors keyed by path.
  if (err.name === "ValidationError") {
    const messages = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({
      success: false,
      message: messages.join(". "),
    });
  }

  // --- MongoDB duplicate-key error (unique index violation) ---
  // err.code 11000 is the MongoDB wire-protocol code for duplicate key.
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || "field";
    return res.status(409).json({
      success: false,
      message: `A record with that ${field} already exists.`,
    });
  }

  // --- Generic fallback ---
  // Use whatever status code a controller already set via res.status(),
  // fall back to err.statusCode, and finally to 500.
  const statusCode =
    res.statusCode && res.statusCode !== 200
      ? res.statusCode
      : err.statusCode || 500;

  // Only log stack traces for unexpected server errors, not for client
  // mistakes (4xx) that are already handled cleanly above.
  if (statusCode >= 500) {
    console.error(err.stack);
  }

  res.status(statusCode).json({
    success: false,
    message: err.message || "Something went wrong on the server.",
  });
}

function notFound(req, res, next) {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
}

module.exports = { errorHandler, notFound };
