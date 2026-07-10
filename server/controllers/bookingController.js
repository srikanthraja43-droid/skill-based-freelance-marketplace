const Booking = require("../models/Booking");
const ProviderProfile = require("../models/ProviderProfile");

// @desc    Create a new booking request
// @route   POST /api/bookings
// @access  Private (Client)
const createBooking = async (req, res) => {
  const {
    providerId,
    category,
    price,
    service,
    scheduledDate,
    scheduledTime,
    estimatedHours,
    notes,
  } = req.body;

  try {
    const booking = await Booking.create({
      clientId: req.user._id,
      providerId,
      category,
      price,
      service,
      scheduledDate,
      scheduledTime,
      estimatedHours,
      notes: notes || "",
    });

    res.status(201).json({ data: booking });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user's bookings (Client or Provider)
// @route   GET /api/bookings/my
// @access  Private
const getMyBookings = async (req, res) => {
  const { status, limit } = req.query;

  try {
    const query = {};

    if (req.user.role === "provider") {
      query.providerId = req.user._id;
    } else {
      query.clientId = req.user._id;
    }

    if (status && status !== "all") {
      query.status = status;
    }

    let dbQuery = Booking.find(query)
      .sort({ createdAt: -1 })
      .populate("clientId", "name email phone avatar location verified")
      .populate("providerId", "name email phone avatar location verified");

    if (limit) {
      dbQuery = dbQuery.limit(parseInt(limit));
    }

    const bookings = await dbQuery;
    const total = await Booking.countDocuments(query);

    res.json({
      data: bookings,
      pagination: {
        total,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update booking status
// @route   PATCH /api/bookings/:bookingId/status
// @access  Private (Client or Provider)
const updateBookingStatus = async (req, res) => {
  const { status, rejectionReason, cancellationReason } = req.body;
  const { bookingId } = req.params;

  try {
    const booking = await Booking.findById(bookingId);

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    const isClient = booking.clientId.toString() === req.user._id.toString();
    const isProvider = booking.providerId.toString() === req.user._id.toString();

    if (!isClient && !isProvider) {
      return res.status(403).json({ message: "Not authorized to update this booking" });
    }

    // Role specific action validation
    if (status === "cancelled") {
      if (!isClient) {
        return res.status(403).json({ message: "Only clients can cancel their booking" });
      }
      booking.cancellationReason = cancellationReason || "No reason specified";
    }

    if (["accepted", "rejected", "in-progress", "completed"].includes(status)) {
      if (!isProvider) {
        return res.status(403).json({ message: "Only providers can accept/reject/manage booking progress" });
      }
      if (status === "rejected") {
        booking.rejectionReason = rejectionReason || "No reason specified";
      }
    }

    // Update status
    booking.status = status;
    await booking.save();

    // If marked as completed, update provider profile bookings count
    if (status === "completed") {
      await ProviderProfile.findOneAndUpdate(
        { userId: booking.providerId },
        { $inc: { totalBookings: 1 } }
      );
    }

    // Populate user references for clean client response
    const updatedBooking = await Booking.findById(booking._id)
      .populate("clientId", "name email phone avatar location verified")
      .populate("providerId", "name email phone avatar location verified");

    res.json({ data: updatedBooking });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createBooking,
  getMyBookings,
  updateBookingStatus,
};
