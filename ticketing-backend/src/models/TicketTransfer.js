

const mongoose = require("mongoose");

const ticketTransferSchema = new mongoose.Schema(
  {
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
      unique: true, // Concept: one order can only ever have ONE transfer record
    },

    // Concept: this is the raw, unique secret string that actually gets
    // verified at entry — NOT the QR image itself. The QR image is just
    // a visual encoding of this string for convenient scanning.
    token: {
      type: String,
      required: true,
      unique: true,
    },

    // Concept: we store the QR as a data URL (base64-encoded PNG) so the
    // frontend can render it directly in an <img src="..."> tag with no
    // extra file storage/hosting needed for this learning phase.
    qrCodeImage: {
      type: String,
      required: true,
    },

    transferredAt: {
      type: Date,
      default: Date.now,
    },

    confirmedByBuyer: {
      type: Boolean,
      default: false,
    },

    confirmedAt: {
      type: Date,
      default: null,
    },

    // Concept: one-time-use guard. Once scanned at the actual event
    // entry, this flips to true and the SAME token can never validate
    // again — this is what stops someone reusing a screenshot of the
    // QR code.
    isUsed: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("TicketTransfer", ticketTransferSchema);