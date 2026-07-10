const express = require("express");
const router = express.Router();
const { createBooking, getMyBookings, updateBookingStatus } = require("../controllers/bookingController");
const { protect } = require("../middleware/authMiddleware");

router.post("/", protect, createBooking);
router.get("/my", protect, getMyBookings);
router.patch("/:bookingId/status", protect, updateBookingStatus);

module.exports = router;
