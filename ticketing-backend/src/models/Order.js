const mongoose = require("mongoose");
const { isValidTransition } = require("../utils/orderStateMachine");

// Order data model for marketplace transactions.
// Includes escrow metadata, lifecycle state, and seller/buyer relationships.
const orderSchema = new mongoose.Schema(
  {
    ticketListing: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "TicketListing",
      required: true,
    },
    buyer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    platformFee: {
      type: Number,
      required: true,
      min: 0,
    },

    stripePaymentIntentId: {
      type: String,
      default: null, // placeholder for future Stripe payment intent integration
    },

    escrowStatus: {
      type: String,
      enum: ["held", "released", "refunded"],
      default: "held",
    },

    status: {
      type: String,
      enum: ["pending", "paid", "transferred", "completed", "cancelled", "refunded", "disputed"],
      default: "pending",
    },
  },
  { timestamps: true }
);

orderSchema.methods.transitionTo = async function (nextStatus) {
  // Validate lifecycle state transition using the order state machine.
  if (!isValidTransition(this.status, nextStatus)) {
    throw new Error(`Cannot move order from '${this.status}' to '${nextStatus}'`);
  }

  this.status = nextStatus;
  await this.save();
  return this;
};

module.exports = mongoose.model("Order", orderSchema);