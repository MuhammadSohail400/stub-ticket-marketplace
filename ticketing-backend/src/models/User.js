const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: 6,
      select: false, // never return password by default on queries
    },
    role: {
      type: String,
      enum: ["buyer", "seller", "admin"],
      default: "buyer",
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    trustScore: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true } // adds createdAt / updatedAt automatically
);

// Concept: Mongoose "pre save" hook runs right before a document is saved.
// We intercept here to hash the plain-text password — this way every
// controller that creates/updates a user doesn't have to remember to hash it.
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return; // skip if unchanged

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Instance method: compare a plain-text login attempt against the stored hash
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};
module.exports = mongoose.model("User", userSchema);