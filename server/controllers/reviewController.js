const Review = require("../models/Review");
const Booking = require("../models/Booking");
const ProviderProfile = require("../models/ProviderProfile");

// @desc    Create a review for a completed booking
// @route   POST /api/reviews
// @access  Private (Client)
const createReview = async (req, res) => {
  const { bookingId, rating, comment, tags } = req.body;

  try {
    const booking = await Booking.findById(bookingId);

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    if (booking.clientId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to review this booking" });
    }

    if (booking.status !== "completed") {
      return res.status(400).json({ message: "Can only review completed bookings" });
    }

    if (booking.isReviewedByClient) {
      return res.status(400).json({ message: "You have already reviewed this booking" });
    }

    // Create review
    const review = await Review.create({
      bookingId,
      reviewerId: req.user._id,
      providerId: booking.providerId,
      rating,
      comment,
      tags: tags || [],
    });

    // Mark booking as reviewed
    booking.isReviewedByClient = true;
    await booking.save();

    // Recalculate ratings & reviewCount for provider profile
    const reviews = await Review.find({ providerId: booking.providerId });
    const reviewCount = reviews.length;
    const avgRating = reviews.reduce((sum, rev) => sum + rev.rating, 0) / reviewCount;

    await ProviderProfile.findOneAndUpdate(
      { userId: booking.providerId },
      { avgRating, reviewCount }
    );

    res.status(201).json({ data: review });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all reviews for a provider
// @route   GET /api/reviews/provider/:id
// @access  Public
const getProviderReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ providerId: req.params.id })
      .sort({ createdAt: -1 })
      .populate("reviewerId", "name avatar");

    res.json({ data: reviews });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createReview,
  getProviderReviews,
};
