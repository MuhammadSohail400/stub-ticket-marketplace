const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema(
  {
    title:{
      type: String,
      required: [true, "Title is required"],
      trim: true,
    }
    ,
    description: {
      type: String,
      required: [true, "Description is required"],
    trim: true,
  },
  category: {
    type: String,
    required: [true, "Category is required"],
    trim: true,
  },
  venue: {
    type: String,
    required: [true, "Venue is required"],
    trim: true,
  },
  city: {
    type: String,
    required: [true, "City is required"],
    trim: true,
  },
  eventDate: {
    type: Date,
    required: [true, "Event date is required"],
  },
  bannerImage: {
    url: {
      type: String,
      required: true,
    },
    public_id: {
      type: String,
      required: true,
    },
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  }
}

)

module.exports = mongoose.model("Event",eventSchema);
