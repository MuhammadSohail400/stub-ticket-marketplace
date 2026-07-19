const express = require("express");
const router = express.Router();
const {
  createOrder,
  getOrderById,
  getMyOrders,
  updateOrderStatus,
} = require("../controllers/orderController");
const { protect } = require("../middleware/auth");

// Order routes expose order creation, retrieval, and status update endpoints.
// All endpoints are protected and require a valid authenticated session.

router.get("/mine", protect, getMyOrders);
router.get("/:id", protect, getOrderById);
router.post("/", protect, createOrder);
router.patch("/:id/status", protect, updateOrderStatus);

module.exports = router;
