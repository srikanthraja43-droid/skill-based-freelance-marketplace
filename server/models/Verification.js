const mongoose = require("mongoose");

const VerificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    idDocumentType: {
      type: String,
      required: [true, "ID document type is required"],
    },
    idDocumentUrl: {
      type: String,
      required: [true, "ID document file is required"],
    },
    skillDocumentDescription: {
      type: String,
      default: "",
    },
    skillDocumentUrl: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    adminNote: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Verification", VerificationSchema);
