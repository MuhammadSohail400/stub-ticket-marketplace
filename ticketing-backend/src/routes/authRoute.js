const express = require("express");
const router = express.Router();
const { signup, login, getMe } = require("../controllers/authController");
const { protect } = require("../middleware/auth");
const { authLimiter } = require("../middleware/rateLimiter");

// Apply strict rate limiting to auth endpoints to prevent brute-force attacks.
// 10 requests per 15-minute window per IP.
router.post("/signup", authLimiter, signup);
router.post("/login", authLimiter, login);

router.get("/me", protect, getMe);

module.exports = router;