

const Order = require("../models/Order");
const TicketListing = require("../models/TicketingListing");
const { createPaymentIntent, constructWebhookEvent } = require("../services/stripeService");

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
    const platformFee = Math.round(amount * 0.05); // 5%, matches the frontend checkout page

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

      await TicketListing.findByIdAndUpdate(reservedListing._id, { status: "listed" });
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

// POST /api/orders/webhook
// Concept: this is called by STRIPE, not by our frontend. There's no
// req.user here — no JWT, no `protect` middleware — because Stripe's
// server doesn't have (and shouldn't need) a user login token. Instead,
// trust comes from the signature check inside constructWebhookEvent.
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


module.exports = { createOrder, getOrderById, getMyOrders, updateOrderStatus,handleStripeWebhook };