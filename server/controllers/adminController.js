const User = require("../models/User");
const Booking = require("../models/Booking");
const Verification = require("../models/Verification");
const ProviderProfile = require("../models/ProviderProfile");
const dbStore = require("../models/supabaseAdapter");

// @desc    Get platform stats
// @route   GET /api/admin/stats
// @access  Private (Admin)
const getStats = async (req, res) => {
  try {
    const allUsers = await dbStore.table("users").select();
    const totalUsers = allUsers.length;
    const totalProviders = allUsers.filter((u) => u.role === "provider").length;
    const totalClients = allUsers.filter((u) => u.role === "client").length;

    const allBookings = await dbStore.table("bookings").select();
    const totalBookings = allBookings.length;

    const allVerifications = await dbStore.table("verifications").select();
    const pendingVerifications = allVerifications.filter((v) => v.status === "pending").length;

    // Booking status counts
    const bookingStatusMap = {
      pending: 0,
      accepted: 0,
      rejected: 0,
      "in-progress": 0,
      completed: 0,
      cancelled: 0,
    };
    allBookings.forEach((b) => {
      if (bookingStatusMap[b.status] !== undefined) {
        bookingStatusMap[b.status]++;
      }
    });

    // Revenue calculation
    const paidBookings = allBookings.filter((b) => b.paymentStatus === "paid");
    const totalVolume = paidBookings.reduce((sum, b) => sum + (Number(b.price) || 0), 0);
    const platformRevenue = Math.round(totalVolume * 0.05 * 100) / 100;

    res.json({
      data: {
        totalUsers,
        totalProviders,
        totalClients,
        totalBookings,
        pendingVerifications,
        bookingStatusMap,
        totalVolume,
        platformRevenue,
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
    let users = await dbStore.table("users").select();

    if (search) {
      const re = new RegExp(search, "i");
      users = users.filter((u) => re.test(u.name) || re.test(u.email));
    }

    users.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));

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
    const verifications = await Verification.find({ status: "pending" }).sort({ createdAt: 1 });
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

    const profileStatus = status === "approved" ? "verified" : "rejected";

    await ProviderProfile.findOneAndUpdate(
      { userId: verification.userId._id || verification.userId },
      { verificationStatus: profileStatus }
    );

    if (status === "approved") {
      await User.findByIdAndUpdate(verification.userId._id || verification.userId, { verified: true });
    }

    res.json({
      message: `Verification request ${status} successfully`,
      data: verification,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Seed 9 sample provider accounts (admin on-demand)
// @route   POST /api/admin/seed-providers
// @access  Private (Admin)
const seedProviders = async (req, res) => {
  try {
    const bcrypt = require("bcryptjs");

    const sampleProviders = [
      { name: "Rohit Sharma",  email: "rohit@demo.com",  city: "Bengaluru", category: "Web Development",   skills: ["React","Node.js","MongoDB","Express","TypeScript"],       bio: "Senior Full Stack Engineer with 6+ years building modern web apps.", rate: 1500, rating: 4.9, reviews: 85,  jobs: 120 },
      { name: "Sneha Patel",   email: "sneha@demo.com",  city: "Mumbai",    category: "UI/UX Design",      skills: ["Figma","UI Design","Prototyping","User Research","Adobe XD"], bio: "Passionate Product Designer creating intuitive digital experiences.", rate: 1200, rating: 4.8, reviews: 60,  jobs: 95  },
      { name: "Arjun Verma",   email: "arjun@demo.com",  city: "New Delhi", category: "Electrical",        skills: ["Wiring","Short Circuit Repair","Inverter Installation","Appliance Repair"], bio: "Certified Industrial & Home Master Electrician with 8+ years. Available 24/7.", rate: 500,  rating: 4.9, reviews: 112, jobs: 180 },
      { name: "Priya Singh",   email: "priya@demo.com",  city: "Hyderabad", category: "Content Writing",   skills: ["Copywriting","SEO Articles","Technical Writing","Blogs"],   bio: "Professional SEO Copywriter and Technical Author for SaaS & tech startups.", rate: 900,  rating: 4.8, reviews: 45,  jobs: 78  },
      { name: "Rajesh Kumar",  email: "rajesh@demo.com", city: "Bengaluru", category: "Electrical",        skills: ["Solar Panel Installation","Circuit Breakers","Heavy Power Appliances","Lighting"], bio: "Master Electrician specializing in commercial and residential setups.", rate: 850,  rating: 4.7, reviews: 54,  jobs: 90  },
      { name: "Vikram Das",    email: "vikram@demo.com", city: "Mumbai",    category: "Plumbing",          skills: ["Pipe Leakage","Bathroom Fitting","Water Heater Repair","Drainage Unclogging"], bio: "Expert Licensed Plumber for emergency repairs and installations.", rate: 450,  rating: 4.8, reviews: 89,  jobs: 140 },
      { name: "Ananya Sharma", email: "ananya@demo.com", city: "New Delhi", category: "Digital Marketing", skills: ["Google Ads","Meta Ads","Social Media Strategy","SEO","Analytics"], bio: "Digital Marketing Consultant helping startups scale revenue online.", rate: 1100, rating: 4.9, reviews: 72,  jobs: 110 },
      { name: "Suresh Rao",    email: "suresh@demo.com", city: "Chennai",   category: "Carpentry",         skills: ["Furniture Assembly","Custom Cabinets","Door Repairs","Wood Polishing"], bio: "Handcrafted Custom Furniture Maker and Residential Carpentry Specialist.", rate: 400,  rating: 4.8, reviews: 96,  jobs: 165 },
      { name: "Meera Nair",    email: "meera@demo.com",  city: "Kochi",     category: "Tutoring",          skills: ["Mathematics","Physics","Computer Science","Competitive Exams","Chemistry"], bio: "M.Tech Graduate & Private Tutor with 5+ years teaching high school & college.", rate: 600,  rating: 5.0, reviews: 40,  jobs: 85  },
    ];

    const password = await bcrypt.hash("Demo@1234", 10);
    let created = 0;

    for (const p of sampleProviders) {
      const allUsers = await dbStore.table("users").select();
      const existing = allUsers.find((u) => u.email === p.email);
      if (existing) continue;

      const user = await User.create({
        name: p.name,
        email: p.email,
        password,
        role: "provider",
        location: { city: p.city, country: "India" },
        verified: true,
        isActive: true,
      });

      await ProviderProfile.create({
        userId: user._id,
        category: p.category,
        skills: p.skills,
        bio: p.bio,
        hourlyRate: p.rate,
        avgRating: p.rating,
        reviewCount: p.reviews,
        totalBookings: p.jobs,
        isAvailable: true,
        verificationStatus: "verified",
      });

      created++;
    }

    res.json({ message: `✅ ${created} sample providers added successfully!`, created });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a single freelancer/provider account
// @route   POST /api/admin/providers
// @access  Private (Admin)
const createProvider = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      category,
      skills,
      bio,
      hourlyRate,
      serviceRadius,
      experience,
      location,
      phone,
    } = req.body;

    if (!name || !email || !category) {
      return res.status(400).json({ message: "Name, email, and category are required" });
    }

    const allUsers = await dbStore.table("users").select();
    const existing = allUsers.find((u) => u.email?.toLowerCase() === email.toLowerCase());
    if (existing) {
      return res.status(400).json({ message: "A user with this email already exists" });
    }

    const User = require("../models/User");
    const ProviderProfile = require("../models/ProviderProfile");

    const user = await User.create({
      name,
      email,
      password: password || "Demo@1234",
      role: "provider",
      phone: phone || "",
      location: location || { type: "Point", coordinates: [0, 0], address: "", city: "" },
      verified: true,
      isActive: true,
    });

    const profile = await ProviderProfile.create({
      userId: user._id,
      category,
      skills: Array.isArray(skills)
        ? skills
        : String(skills || "")
            .split(",")
            .map((skill) => skill.trim())
            .filter(Boolean),
      bio: bio || "",
      hourlyRate: Number(hourlyRate) || 0,
      serviceRadius: Number(serviceRadius) || 10,
      experience: Number(experience) || 0,
      languages: ["English"],
      avgRating: 0,
      reviewCount: 0,
      totalBookings: 0,
      verificationStatus: "verified",
      isAvailable: true,
      isFeatured: true,
      featuredTitle: category,
    });

    res.status(201).json({
      message: "Freelancer added successfully",
      data: { user, profile },
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
  seedProviders,
  createProvider,
};
