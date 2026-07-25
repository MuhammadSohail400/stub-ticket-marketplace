const Order = require("../models/Order");
const TicketListing = require("../models/TicketingListing");
const { createPaymentIntent, constructWebhookEvent } = require("../services/stripeService");
const { PLATFORM_FEE_RATE, DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE } = require("../config/constants");

// POST /api/orders
// Creates an order for the authenticated buyer, atomically reserving the
// listing to prevent double-purchase race conditions.
async function createOrder(req, res, next) {
  try {
    const { ticketListingId } = req.body;

    if (!ticketListingId) {
      res.status(400);
      throw new Error("ticketListingId is required");
    }

    const listingPreview = await TicketListing.findById(ticketListingId);

    if (!listingPreview) {
      res.status(404);
      throw new Error("Ticket listing not found");
    }

    if (listingPreview.seller.toString() === req.user._id.toString()) {
      res.status(400);
      throw new Error("You cannot buy your own listing");
    }

    // Atomic compare-and-swap: only succeeds if the listing is still "listed".
    // This is the correct fix for the double-purchase race condition — a
    // find() then save() pattern would have a window where two buyers could
    // both read "listed" and both proceed.
    const reservedListing = await TicketListing.findOneAndUpdate(
      { _id: ticketListingId, status: "listed" },
      { status: "reserved" },
      { new: true } // return the document AFTER the update, not before
    );

    if (!reservedListing) {
      res.status(400);
      throw new Error("This ticket is no longer available");
    }

    const amount = reservedListing.price;
    const platformFee = Math.round(amount * PLATFORM_FEE_RATE);

    let order;
    try {
      order = await Order.create({
        ticketListing: reservedListing._id,
        buyer: req.user._id,
        seller: reservedListing.seller,
        amount,
        platformFee,
      });

      const totalChargeAmount = amount + platformFee;
      const paymentIntent = await createPaymentIntent(totalChargeAmount);

      order.stripePaymentIntentId = paymentIntent.id;
      await order.save();

      res.status(201).json({
        success: true,
        order,
        clientSecret: paymentIntent.client_secret,
      });
    } catch (innerError) {
      // Rollback: restore listing availability and remove the orphaned Order
      // document (which has no stripePaymentIntentId and can never be paid).
      await TicketListing.findByIdAndUpdate(reservedListing._id, { status: "listed" });
      if (order && order._id) {
        await Order.findByIdAndDelete(order._id);
      }
      throw innerError;
    }
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
// Retrieves paginated order history for the current buyer or seller,
// in reverse chronological order.
async function getMyOrders(req, res, next) {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(
      MAX_PAGE_SIZE,
      Math.max(1, parseInt(req.query.limit, 10) || DEFAULT_PAGE_SIZE)
    );
    const skip = (page - 1) * limit;

    const filter = {
      $or: [{ buyer: req.user._id }, { seller: req.user._id }],
    };

    const [orders, total] = await Promise.all([
      Order.find(filter)
        .populate("ticketListing")
        .populate("buyer", "name email")
        .populate("seller", "name email")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Order.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      total,
      page,
      pages: Math.ceil(total / limit),
      orders,
    });
  } catch (error) {
    next(error);
  }
}

// PATCH /api/orders/:id/status
//
// SECURITY: uses an explicit allow-list per role rather than a block-list.
// This prevents any party from forging privileged status transitions.
//
// What each role is allowed to set via this endpoint:
//   buyer  → "completed" (confirm receipt), "disputed", "cancelled"
//   seller → "disputed", "cancelled"
//   admin  → any valid state-machine transition
//
// What is NOT allowed here (by design):
//   "paid"     — only settable by handleStripeWebhook (Stripe webhook)
//   "refunded" — only settable by handleStripeWebhook or a future admin refund action
//
// The state machine (orderStateMachine.js) still enforces the shape of
// transitions; this layer enforces who is allowed to initiate them.
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

    // Explicit allow-list: only the statuses each role may set through
    // this public endpoint. "paid" and "refunded" are intentionally absent
    // — only the Stripe webhook handler may set those.
    const allowedByRole = {
      buyer: ["completed", "disputed", "cancelled"],
      seller: ["disputed", "cancelled"],
    };

    if (!isAdmin) {
      const role = isBuyer ? "buyer" : "seller";
      if (!allowedByRole[role].includes(nextStatus)) {
        res.status(403);
        throw new Error(
          `A ${role} is not permitted to set order status to '${nextStatus}'.`
        );
      }
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

// POST /api/orders/webhook
// Concept: this is called by STRIPE, not by our frontend. There's no
// req.user here — no JWT, no `protect` middleware — because Stripe's
// server doesn't have (and shouldn't need) a user login token. Instead,
// trust comes from the signature check inside constructWebhookEvent.
//
// "paid" and "refunded" are the ONLY statuses this handler sets, and
// this is the ONLY place they can be set — that's the design guarantee
// behind removing them from updateOrderStatus's allow-list.
async function handleStripeWebhook(req, res, next) {
  const signature = req.headers["stripe-signature"];

  let event;
  try {
    // req.body here must be the RAW, unparsed buffer — see app.js, where
    // this route is registered with express.raw() instead of
    // express.json(), specifically so this signature check works.
    event = constructWebhookEvent(req.body, signature);
  } catch (error) {
    // Concept: if this fails, either the signature is invalid (someone
    // forging a request) or STRIPE_WEBHOOK_SECRET is misconfigured.
    // Respond with 400 so Stripe knows to NOT retry this — it's not a
    // transient server error, it's a rejected/untrusted request.
    console.error("Webhook signature verification failed:", error.message);
    return res.status(400).send(`Webhook Error: ${error.message}`);
  }

  try {
    if (event.type === "payment_intent.succeeded") {
      const paymentIntent = event.data.object;

      const order = await Order.findOne({
        stripePaymentIntentId: paymentIntent.id,
      });

      if (order) {
        // Concept: idempotency check. Stripe can send the same webhook
        // event more than once (network retries) — if we already moved
        // this order to "paid", transitionTo("paid") would be called on
        // an order that's no longer "pending", and our state machine
        // would correctly throw. We guard against that here instead of
        // letting it become an unhandled error on a legitimate retry.
        if (order.status === "pending") {
          await order.transitionTo("paid");
          order.escrowStatus = "held";
          await order.save();
        }
      }
    }

    // Concept: Stripe expects a fast 200 response just to acknowledge
    // receipt — it doesn't care about our response body. If we don't
    // respond within its timeout, Stripe assumes failure and retries.
    res.status(200).json({ received: true });
  } catch (error) {
    next(error);
  }
}

module.exports = { createOrder, getOrderById, getMyOrders, updateOrderStatus, handleStripeWebhook };