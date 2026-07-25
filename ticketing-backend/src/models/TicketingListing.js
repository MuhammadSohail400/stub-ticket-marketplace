const mongoose = require("mongoose");

const ticketingListingSchema = new mongoose.Schema(
  {
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      required: [true, "Event reference is required"],
    },
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Seller reference is required"],
    },
    section: {
      type: String,
      required: [true, "Section is required"],
      trim: true,
    },
    seatInfo: {
      type: String,
      required: [true, "Seat information is required"],
      trim: true,
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [0, "Price must be a positive number"],
    },
    faceValue: {
      type: Number,
      required: [true, "Face value is required"],
      min: [0, "Face value must be a positive number"],
    },
    quantity: {
      type: Number,
      required: [true, "Quantity is required"],
      min: [1, "Quantity must be at least 1"],
    },
    proofImage: {
      url: {
        type: String,
        required: true,
      },
      public_id: {
        type: String,
        required: true,
      },
    },
    status: {
      type: String,
      enum: ["listed", "reserved", "paid", "transferred", "completed", "cancelled", "disputed"],
      default: "listed",
    },
  },
  { timestamps: true } // adds createdAt / updatedAt (replaces manual createdAt field)
);

module.exports = mongoose.model("TicketingListing", ticketingListingSchema);
