const jwt = require("jsonwebtoken");
const User = require("../models/User");
const ProviderProfile = require("../models/ProviderProfile");
const dbStore = require("../models/supabaseAdapter");

const generateTokens = (user) => {
  const accessToken = jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "15m" }
  );

  const refreshToken = jwt.sign(
    { id: user._id },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: "7d" }
  );

  return { accessToken, refreshToken };
};

// @desc    Register a new user
// @route   POST /api/auth/signup
// @access  Public
const signup = async (req, res) => {
  const { name, email, password, role, phone, location } = req.body;

  try {
    // Check for existing user by email
    const allUsers = await dbStore.table("users").select();
    const userExists = allUsers.find((u) => u.email?.toLowerCase() === email?.toLowerCase());
    if (userExists) {
      return res.status(400).json({ message: "Email is already registered" });
    }

    const user = await User.create({
      name,
      email,
      password,
      role: role || "client",
      phone,
      location: location || { type: "Point", coordinates: [0, 0] },
    });

    let providerProfile = null;
    if (user.role === "provider") {
      providerProfile = await ProviderProfile.create({
        userId: user._id,
        category: "Other",
        skills: [],
        availability: {
          monday: true,
          tuesday: true,
          wednesday: true,
          thursday: true,
          friday: true,
          saturday: false,
          sunday: false,
          startTime: "09:00",
          endTime: "18:00",
        },
      });
    }

    const { accessToken, refreshToken } = generateTokens(user);

    // Save refresh token to user
    user.refreshTokens.push(refreshToken);
    await user.save();

    res.status(201).json({
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        avatar: user.avatar,
        location: user.location,
        verified: user.verified,
      },
      accessToken,
      refreshToken,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Fetch with password included
    const allUsers = await dbStore.table("users").select();
    const rawUser = allUsers.find((u) => u.email?.toLowerCase() === email?.toLowerCase());

    if (!rawUser) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const { UserDoc } = require("../models/User").__UserDoc__ || {};
    const bcrypt = require("bcryptjs");
    const isMatch = await bcrypt.compare(password, rawUser.password || "");

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    if (rawUser.isActive === false) {
      return res.status(403).json({ message: "Your account is deactivated. Contact administration." });
    }

    const user = await User.findById(rawUser._id || rawUser.id);

    const { accessToken, refreshToken } = generateTokens(user);

    user.refreshTokens = user.refreshTokens || [];
    user.refreshTokens.push(refreshToken);
    await user.save();

    res.json({
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        avatar: user.avatar,
        location: user.location,
        verified: user.verified,
      },
      accessToken,
      refreshToken,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Logout user / clear token
// @route   POST /api/auth/logout
// @access  Public
const logout = async (req, res) => {
  const { refreshToken } = req.body;

  try {
    if (refreshToken) {
      const allUsers = await dbStore.table("users").select();
      const rawUser = allUsers.find(
        (u) => Array.isArray(u.refreshTokens) && u.refreshTokens.includes(refreshToken)
      );
      if (rawUser) {
        const user = await User.findById(rawUser._id || rawUser.id);
        user.refreshTokens = user.refreshTokens.filter((rt) => rt !== refreshToken);
        await user.save();
      }
    }
    res.json({ message: "Logged out successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Refresh access token
// @route   POST /api/auth/refresh
// @access  Public
const refresh = async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(401).json({ message: "Refresh token is required" });
  }

  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const user = await User.findById(decoded.id);

    if (!user || !user.refreshTokens || !user.refreshTokens.includes(refreshToken)) {
      return res.status(403).json({ message: "Invalid or expired refresh token" });
    }

    // Generate new tokens (token rotation)
    const tokens = generateTokens(user);

    // Replace old refresh token with new one
    user.refreshTokens = user.refreshTokens.filter((rt) => rt !== refreshToken);
    user.refreshTokens.push(tokens.refreshToken);
    await user.save();

    res.json({
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    });
  } catch (error) {
    res.status(403).json({ message: "Refresh token is invalid or expired" });
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    let providerProfile = null;

    if (user.role === "provider") {
      providerProfile = await ProviderProfile.findOne({ userId: user._id });
    }

    res.json({
      ...user.toObject(),
      providerProfile,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  signup,
  login,
  logout,
  refresh,
  getMe,
};
