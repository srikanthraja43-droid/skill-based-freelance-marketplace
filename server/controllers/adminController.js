const User = require("../models/User");
const Booking = require("../models/Booking");
const Verification = require("../models/Verification");
const ProviderProfile = require("../models/ProviderProfile");

// @desc    Get platform stats
// @route   GET /api/admin/stats
// @access  Private (Admin)
const getStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalProviders = await User.countDocuments({ role: "provider" });
    const totalClients = await User.countDocuments({ role: "client" });
    const totalBookings = await Booking.countDocuments();
    const pendingVerifications = await Verification.countDocuments({ status: "pending" });

    // Aggregate booking statuses
    const statusGroups = await Booking.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    const bookingStatusMap = {
      pending: 0,
      accepted: 0,
      rejected: 0,
      "in-progress": 0,
      completed: 0,
      cancelled: 0,
    };

    statusGroups.forEach((group) => {
      bookingStatusMap[group._id] = group.count;
    });

    res.json({
      data: {
        totalUsers,
        totalProviders,
        totalClients,
        totalBookings,
        pendingVerifications,
        bookingStatusMap,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all users with search
// @route   GET /api/admin/users
// @access  Private (Admin)
const getUsers = async (req, res) => {
  const { search } = req.query;

  try {
    const query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    const users = await User.find(query).sort({ createdAt: -1 });
    res.json({ data: users });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Ban or activate a user
// @route   PATCH /api/admin/users/:id/ban
// @access  Private (Admin)
const toggleUserActiveState = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.role === "admin") {
      return res.status(400).json({ message: "Cannot ban an administrator account" });
    }

    user.isActive = !user.isActive;
    
    // Clear refresh tokens if banning user
    if (!user.isActive) {
      user.refreshTokens = [];
    }
    
    await user.save();

    res.json({
      message: `User has been ${user.isActive ? "activated" : "banned"} successfully`,
      data: user,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all pending verification requests
// @route   GET /api/admin/verifications
// @access  Private (Admin)
const getPendingVerifications = async (req, res) => {
  try {
    const verifications = await Verification.find({ status: "pending" })
      .populate("userId", "name email avatar")
      .sort({ createdAt: 1 });

    res.json({ data: verifications });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Approve or reject verification request
// @route   PATCH /api/admin/verifications/:id
// @access  Private (Admin)
const reviewVerification = async (req, res) => {
  const { status, adminNote } = req.body;

  if (!["approved", "rejected"].includes(status)) {
    return res.status(400).json({ message: "Invalid status value. Must be approved or rejected" });
  }

  try {
    const verification = await Verification.findById(req.params.id);

    if (!verification) {
      return res.status(404).json({ message: "Verification request not found" });
    }

    verification.status = status;
    verification.adminNote = adminNote || "";
    await verification.save();

    // Map approved to "verified" and rejected to "rejected"
    const profileStatus = status === "approved" ? "verified" : "rejected";

    // Update provider profile
    await ProviderProfile.findOneAndUpdate(
      { userId: verification.userId },
      { verificationStatus: profileStatus }
    );

    // Update user verified flag
    if (status === "approved") {
      await User.findByIdAndUpdate(verification.userId, { verified: true });
    }

    res.json({
      message: `Verification request ${status} successfully`,
      data: verification,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getStats,
  getUsers,
  toggleUserActiveState,
  getPendingVerifications,
  reviewVerification,
};
