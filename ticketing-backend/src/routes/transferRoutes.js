const express = require("express");
const router = express.Router();
const {
  initiateTransfer,
  getTransferByOrder,
  confirmTransfer,
  validateTicket,
} = require("../controllers/transferController");
const { protect } = require("../middleware/auth");
const { validateLimiter } = require("../middleware/rateLimiter");

// "/validate" is registered BEFORE "/:orderId" — same route-order
// reasoning as "/mine" in orderRoutes.js. If "/:orderId" came first,
// Express would treat "validate" as if it were an orderId.
//
// It's intentionally NOT protected by buyer/seller JWT — it represents
// a gate-scanner action (a different kind of actor). The validateLimiter
// is the primary defence here: 30 req/15min per IP limits token enumeration
// and DoS against this public endpoint.
router.post("/validate", validateLimiter, validateTicket);

router.post("/:orderId", protect, initiateTransfer);
router.get("/:orderId", protect, getTransferByOrder);
router.patch("/:orderId/confirm", protect, confirmTransfer);

module.exports = router;