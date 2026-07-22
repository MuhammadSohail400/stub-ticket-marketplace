const TicketTransfer = require("../models/TicketTransfer");
const Order = require("../models/Order");
const { generateUniqueToken, generateQRCodeImage } = require("../services/qrService");
const { uploadImage,deleteImage } = require("../services/cloudinaryService");

// POST /api/transfers/:orderId
// Concept: only the SELLER of this specific order can initiate a
// transfer — a buyer "sending themselves" a ticket, or a random third
// party generating a QR for someone else's order, would defeat the
// entire point of proof-of-transfer.
async function initiateTransfer(req, res, next) {
  try {
    const order = await Order.findById(req.params.orderId);

    if (!order) {
      res.status(404);
      throw new Error("Order not found");
    }

    if (order.seller.toString() !== req.user._id.toString() && req.user.role !== "admin") {
      res.status(403);
      throw new Error("Only the seller can initiate the ticket transfer for this order");
    }

    // Concept: business rule mirrors our state machine — a transfer only
    // makes sense once payment is confirmed. This check exists in
    // ADDITION to Order.transitionTo() (below) as a clear, specific
    // error message before we even attempt anything else.
    if (order.status !== "paid") {
      res.status(400);
      throw new Error(`Cannot initiate transfer — order status is '${order.status}', expected 'paid'`);
    }

    const existingTransfer = await TicketTransfer.findOne({ order: order._id });
    if (existingTransfer) {
      res.status(409);
      throw new Error("A transfer has already been initiated for this order");
    }

    const token = generateUniqueToken();
    const qrBuffer = await generateQRCodeImage(token);

    const uploadedQR = await uploadImage(
       qrBuffer,
      "ticket-qrcodes"
);



    const transfer = await TicketTransfer.create({
      order: order._id,
      token,
       qrCodeImage: {
    url: uploadedQR.secure_url,
    public_id: uploadedQR.public_id,
  },
    });

    // Concept: this delegates to the state machine — order.transitionTo()
    // will throw if "paid -> transferred" weren't a valid move, but we
    // already know it is (see orderStateMachine.js). We still let the
    // model be the single source of truth rather than setting
    // order.status directly here.
    await order.transitionTo("transferred");

    res.status(201).json({
      success: true,
      transfer,
    });
  } catch (error) {
    next(error);
  }
}

// GET /api/transfers/:orderId
// Concept: lets the buyer (or seller) fetch the QR code image to
// display/download after it's been generated.
async function getTransferByOrder(req, res, next) {
  try {
    const order = await Order.findById(req.params.orderId);
    if (!order) {
      res.status(404);
      throw new Error("Order not found");
    }

    const isBuyer = order.buyer.toString() === req.user._id.toString();
    const isSeller = order.seller.toString() === req.user._id.toString();
    if (!isBuyer && !isSeller && req.user.role !== "admin") {
      res.status(403);
      throw new Error("Not authorized to view this transfer");
    }

    const transfer = await TicketTransfer.findOne({ order: order._id });
    if (!transfer) {
      res.status(404);
      throw new Error("No transfer has been generated for this order yet");
    }

    res.status(200).json({
      success: true,
      transfer,
    });
  } catch (error) {
    next(error);
  }
}

// PATCH /api/transfers/:orderId/confirm
// Concept: only the BUYER can confirm they received the ticket. This is
// the step that finally releases escrow — the seller only gets paid
// once the buyer, who has no incentive to lie in the seller's favor,
// vouches that the transfer actually happened.
async function confirmTransfer(req, res, next) {
  try {
    const order = await Order.findById(req.params.orderId);
    if (!order) {
      res.status(404);
      throw new Error("Order not found");
    }

    if (order.buyer.toString() !== req.user._id.toString() && req.user.role !== "admin") {
      res.status(403);
      throw new Error("Only the buyer can confirm receipt of this ticket");
    }

    const transfer = await TicketTransfer.findOne({ order: order._id });
    if (!transfer) {
      res.status(404);
      throw new Error("No transfer exists for this order yet");
    }

    if (transfer.confirmedByBuyer) {
      res.status(400);
      throw new Error("This transfer has already been confirmed");
    }

    transfer.confirmedByBuyer = true;
    transfer.confirmedAt = new Date();
    await transfer.save();

    // This will throw if order.status isn't "transferred" — e.g. if
    // someone tries to confirm before a transfer was ever initiated.
    await order.transitionTo("completed");

    // Concept: THIS is the escrow release trigger. Buyer confirmation
    // is the one event that moves money (conceptually, for now — no
    // real fund movement without Stripe Connect, which is out of scope)
    // from "held" to "released" to the seller.
    order.escrowStatus = "released";
    await order.save();

    res.status(200).json({
      success: true,
      message: "Transfer confirmed, order completed, escrow released to seller",
      order,
      transfer,
    });
  } catch (error) {
    next(error);
  }
}

// POST /api/transfers/validate
// Concept: simulates what would happen at the actual event entry gate —
// someone scans the QR code, the scanner app sends us the decoded
// token, and we check: does this token exist, and has it NOT been used
// yet? This is deliberately a separate, focused endpoint — gate staff
// scanning tickets have nothing to do with buyer/seller authentication,
// so this route is intentionally NOT behind the usual buyer/seller
// `protect` checks (though in a real deployment, it WOULD be protected
// by a separate "gate staff" role — left as a stretch improvement).
async function validateTicket(req, res, next) {
  try {
    const { token } = req.body;

    if (!token) {
      res.status(400);
      throw new Error("token is required");
    }

    const transfer = await TicketTransfer.findOne({ token });

    if (!transfer) {
      res.status(404);
      throw new Error("Invalid ticket — no matching transfer found");
    }

    // Concept: THIS check is what makes the token one-time-use. Without
    // it, a screenshot of a valid QR code could be reused indefinitely.
    if (transfer.isUsed) {
      res.status(400);
      throw new Error("This ticket has already been used for entry");
    }

    transfer.isUsed = true;
    await transfer.save();

    res.status(200).json({
      success: true,
      message: "Ticket validated — entry granted",
    });
  } catch (error) {
    next(error);
  }
}

module.exports = { initiateTransfer, getTransferByOrder, confirmTransfer, validateTicket };