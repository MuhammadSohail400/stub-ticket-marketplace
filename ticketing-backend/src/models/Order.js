const mongoose = require("mongoose");
const { isValidTransition } = require("../utils/orderStateMachine");

// Order data model for marketplace transactions.
// Includes escrow metadata, lifecycle state, and seller/buyer relationships.
const orderSchema = new mongoose.Schema(
  {
    ticketListing: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "TicketingListing",
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
      default: null,
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

// Compound index on the fields used by the getMyOrders $or query.
// Without this, MongoDB performs a full collection scan for every call;
// with it, both the buyer-side and seller-side halves of the $or can
// use the index efficiently once data volume grows.
orderSchema.index({ buyer: 1, createdAt: -1 });
orderSchema.index({ seller: 1, createdAt: -1 });

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