const Booking = require("../models/Booking");
const ProviderProfile = require("../models/ProviderProfile");
const dbStore = require("../models/supabaseAdapter");

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

    let dbQuery = Booking.find(query).sort({ createdAt: -1 });

    if (limit) {
      dbQuery = dbQuery.limit(parseInt(limit));
    }

    const bookings = await dbQuery;
    const total = bookings.length;

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

    const clientId = booking.clientId?._id?.toString() || booking.clientId?.toString();
    const providerId = booking.providerId?._id?.toString() || booking.providerId?.toString();
    const isClient = clientId === req.user._id.toString();
    const isProvider = providerId === req.user._id.toString();

    if (!isClient && !isProvider) {
      return res.status(403).json({ message: "Not authorized to update this booking" });
    }

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

    booking.status = status;
    await booking.save();

    // Increment provider total bookings on completion
    if (status === "completed") {
      await ProviderProfile.findOneAndUpdate(
        { userId: providerId },
        { $inc: { totalBookings: 1 } }
      );
    }

    const updatedBooking = await Booking.findById(booking._id);
    res.json({ data: updatedBooking });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Process payment for a booking
// @route   POST /api/bookings/:bookingId/pay
// @access  Private (Client)
const processPayment = async (req, res) => {
  const { bookingId } = req.params;
  const { paymentMethod } = req.body;

  try {
    const booking = await Booking.findById(bookingId);

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    const clientId = booking.clientId?._id?.toString() || booking.clientId?.toString();
    if (clientId !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to pay for this booking" });
    }

    if (booking.paymentStatus === "paid") {
      return res.status(400).json({ message: "Booking is already paid" });
    }

    const randomTxn = "TXN-" + Math.floor(10000000 + Math.random() * 90000000);
    const randomInv = "INV-2026-" + Math.floor(1000 + Math.random() * 9000);

    booking.paymentStatus = "paid";
    booking.paymentMethod = paymentMethod || "Credit Card";
    booking.transactionId = randomTxn;
    booking.invoiceNumber = randomInv;
    booking.paidAt = new Date();

    await booking.save();

    const updatedBooking = await Booking.findById(booking._id);
    res.json({
      message: "Payment processed successfully",
      data: updatedBooking,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get booking digital invoice/receipt
// @route   GET /api/bookings/:bookingId/invoice
// @access  Private
const getInvoice = async (req, res) => {
  const { bookingId } = req.params;

  try {
    const booking = await Booking.findById(bookingId);

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    const platformFee = Math.round(booking.price * 0.05 * 100) / 100;
    const providerPayout = Math.round((booking.price - platformFee) * 100) / 100;

    res.json({
      data: {
        invoiceNumber: booking.invoiceNumber || `INV-${booking._id.toString().slice(-6)}`,
        transactionId: booking.transactionId || `TXN-${booking._id.toString().slice(-6)}`,
        issueDate: booking.paidAt || booking.createdAt,
        serviceName: booking.service,
        category: booking.category,
        client: booking.clientId,
        provider: booking.providerId,
        amount: booking.price,
        platformFee,
        providerPayout,
        paymentStatus: booking.paymentStatus,
        paymentMethod: booking.paymentMethod || "Online Card Payment",
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createBooking,
  getMyBookings,
  updateBookingStatus,
  processPayment,
  getInvoice,
};
