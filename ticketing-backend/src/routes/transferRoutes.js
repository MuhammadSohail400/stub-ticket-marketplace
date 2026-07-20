const express = require("express");
const router = express.Router();
const {
  initiateTransfer,
  getTransferByOrder,
  confirmTransfer,
  validateTicket,
} = require("../controllers/transferController");
const { protect } = require("../middleware/auth");

// Concept: "/validate" is registered BEFORE "/:orderId" — same route-order
// reasoning as "/mine" in orderRoutes.js. If "/:orderId" came first,
// Express would treat "validate" as if it were an orderId.
//
// It's also intentionally NOT protected by our normal buyer/seller JWT
// check — it represents a gate-scanner action, a different kind of
// actor entirely. In a real deployment this would have its own auth
// (e.g. a "staff" API key), left as a stretch goal.
router.post("/validate", validateTicket);

router.post("/:orderId", protect, initiateTransfer);
router.get("/:orderId", protect, getTransferByOrder);
router.patch("/:orderId/confirm", protect, confirmTransfer);

module.exports = router;