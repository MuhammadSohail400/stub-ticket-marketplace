

const Order = require("../models/Order");
const TicketListing = require("../models/TicketingListing");

// Order controller for ticket marketplace workflows.
// Responsibilities include order creation, authorization checks,
// order retrieval, and status transitions.
async function createOrder(req, res, next) {
  try {
    const { ticketListingId } = req.body;

    if (!ticketListingId) {
      res.status(400);
      throw new Error("ticketListingId is required");
    }

    // Validate the requested listing and ensure it is still available.
    const listing = await TicketListing.findById(ticketListingId);
    if (!listing) {
      res.status(404);
      throw new Error("Ticket listing not found");
    }

    if (listing.status !== "listed") {
      res.status(400);
      throw new Error("This ticket is no longer available");
    }

    // Prevent marketplace users from purchasing their own inventory.
    if (listing.seller.toString() === req.user._id.toString()) {
      res.status(400);
      throw new Error("You cannot buy your own listing");
    }

    const amount = listing.price;
    const platformFee = Math.round(amount * 0.05);

    const order = await Order.create({
      ticketListing: listing._id,
      buyer: req.user._id,
      seller: listing.seller,
      amount,
      platformFee,
    });

    // Reserve the listing to prevent concurrent purchases.
    listing.status = "reserved";
    await listing.save();

    res.status(201).json({
      success: true,
      order,
    });
  } catch (error) {
    next(error);
  }
}


// GET /api/orders/:id
// Returns order details for the authenticated user, with role-based access control.
async function getOrderById(req, res, next) {
  try {
    const order = await Order.findById(req.params.id)
      .populate("ticketListing")
      .populate("buyer", "name email")
      .populate("seller", "name email");

    if (!order) {
      res.status(404);
      throw new Error("Order not found");
    }


    const isBuyer = order.buyer._id.toString() === req.user._id.toString();
    const isSeller = order.seller._id.toString() === req.user._id.toString();
    const isAdmin = req.user.role === "admin";

    // Enforce role-based access for sensitive order data.
    if (!isBuyer && !isSeller && !isAdmin) {
      res.status(403);
      throw new Error("Not authorized to view this order");
    }

    res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    next(error);
  }
}


// GET /api/orders/mine
// Retrieves order history for the current buyer or seller in reverse chronological order.
async function getMyOrders(req, res, next) {
  try {
    const orders = await Order.find({
      $or: [{ buyer: req.user._id }, { seller: req.user._id }],
    })
      .populate("ticketListing")
      .populate("buyer", "name email")
      .populate("seller", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      orders,
    });
  } catch (error) {
    next(error);
  }
}

// PATCH /api/orders/:id/status
// Applies a lifecycle transition to the order after validating role and state.
async function updateOrderStatus(req, res, next) {
  try {
    const { status: nextStatus } = req.body;

    if (!nextStatus) {
      res.status(400);
      throw new Error("status is required");
    }

    const order = await Order.findById(req.params.id);
    if (!order) {
      res.status(404);
      throw new Error("Order not found");
    }

    const isBuyer = order.buyer.toString() === req.user._id.toString();
    const isSeller = order.seller.toString() === req.user._id.toString();
    const isAdmin = req.user.role === "admin";

    if (!isBuyer && !isSeller && !isAdmin) {
      res.status(403);
      throw new Error("Not authorized to update this order");
    }

    const sellerOnlyTransitions = ["transferred"];
    const buyerOnlyTransitions = ["completed"];

    // Guard against unauthorized status changes based on order role.
    if (sellerOnlyTransitions.includes(nextStatus) && !isSeller && !isAdmin) {
      res.status(403);
      throw new Error("Only the seller can mark this order as transferred");
    }

    if (buyerOnlyTransitions.includes(nextStatus) && !isBuyer && !isAdmin) {
      res.status(403);
      throw new Error("Only the buyer can confirm receipt and complete this order");
    }

    await order.transitionTo(nextStatus);

    // Restore listing availability when the order is cancelled or refunded.
    if (nextStatus === "cancelled" || nextStatus === "refunded") {
      await TicketListing.findByIdAndUpdate(order.ticketListing, {
        status: "listed",
      });
    }

    res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {

    if (!res.statusCode || res.statusCode === 200) {
      res.status(400);
    }
    next(error);
  }
}

module.exports = { createOrder, getOrderById, getMyOrders, updateOrderStatus };