const mongoose = require("mongoose");

const BookingSchema = new mongoose.Schema(
  {
    clientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    providerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    service: {
      type: String,
      required: [true, "Service description is required"],
      trim: true,
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      trim: true,
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected", "in-progress", "completed", "cancelled"],
      default: "pending",
    },
    scheduledDate: {
      type: Date,
      required: [true, "Date is required"],
    },
    scheduledTime: {
      type: String,
      required: [true, "Time is required"],
    },
    estimatedHours: {
      type: Number,
      default: 1,
      min: 0.5,
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: 0,
    },
    notes: {
      type: String,
      default: "",
    },
    rejectionReason: {
      type: String,
      default: "",
    },
    cancellationReason: {
      type: String,
      default: "",
    },
    isReviewedByClient: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Booking", BookingSchema);
