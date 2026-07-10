const mongoose = require("mongoose");

const AvailabilitySchema = new mongoose.Schema({
  monday: { type: Boolean, default: true },
  tuesday: { type: Boolean, default: true },
  wednesday: { type: Boolean, default: true },
  thursday: { type: Boolean, default: true },
  friday: { type: Boolean, default: true },
  saturday: { type: Boolean, default: false },
  sunday: { type: Boolean, default: false },
  startTime: { type: String, default: "09:00" },
  endTime: { type: String, default: "18:00" },
}, { _id: false });

const PortfolioItemSchema = new mongoose.Schema({
  url: { type: String, required: true },
  caption: { type: String, default: "" },
});

const ProviderProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      trim: true,
    },
    skills: [String],
    bio: {
      type: String,
      default: "",
    },
    hourlyRate: {
      type: Number,
      default: 0,
      min: 0,
    },
    serviceRadius: {
      type: Number,
      default: 10, // In kilometers
      min: 1,
    },
    experience: {
      type: Number,
      default: 0,
      min: 0,
    },
    languages: {
      type: [String],
      default: ["English"],
    },
    availability: {
      type: AvailabilitySchema,
      default: () => ({}),
    },
    portfolio: [PortfolioItemSchema],
    avgRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    reviewCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalBookings: {
      type: Number,
      default: 0,
      min: 0,
    },
    verificationStatus: {
      type: String,
      enum: ["unverified", "pending", "verified", "rejected"],
      default: "unverified",
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("ProviderProfile", ProviderProfileSchema);
