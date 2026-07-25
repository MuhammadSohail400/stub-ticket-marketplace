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

    // The QR code is stored as a Cloudinary-hosted image (url + public_id).
    // The token above is encoded into the QR visually; when scanned, the
    // decoded string (the token) is what gets sent to POST /transfers/validate.
    qrCodeImage: {
      url: {
        type: String,
        required: true,
      },
      public_id: {
        type: String,
        required: true,
      },
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