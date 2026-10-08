const express = require("express");
const router = express.Router();
const {
  createBooking,
  getMyBookings,
  updateBookingStatus,
  processPayment,
  getInvoice,
} = require("../controllers/bookingController");
const { protect } = require("../middleware/authMiddleware");

router.post("/", protect, createBooking);
router.get("/my", protect, getMyBookings);
router.patch("/:bookingId/status", protect, updateBookingStatus);
router.post("/:bookingId/pay", protect, processPayment);
router.get("/:bookingId/invoice", protect, getInvoice);

module.exports = router;

