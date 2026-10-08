const User = require("../models/User");
const ProviderProfile = require("../models/ProviderProfile");
const Verification = require("../models/Verification");
const dbStore = require("../models/supabaseAdapter");

// @desc    Search providers with filters
// @route   GET /api/providers/search
// @access  Public
const searchProviders = async (req, res) => {
  const {
    skill,
    category,
    lat,
    lng,
    radius,
    minRate,
    maxRate,
    minRating,
    sort,
    page = 1,
    limit = 10,
  } = req.query;

  try {
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skipNum = (pageNum - 1) * limitNum;

    // Fetch all providers and their profiles
    let results = await User.aggregate([]);

    // Apply filters
    if (category) {
      results = results.filter((r) =>
        r.category?.toLowerCase() === category.toLowerCase()
      );
    }

    if (minRate) {
      results = results.filter((r) => Number(r.hourlyRate) >= parseFloat(minRate));
    }

    if (maxRate) {
      results = results.filter((r) => Number(r.hourlyRate) <= parseFloat(maxRate));
    }

    if (minRating) {
      results = results.filter((r) => Number(r.avgRating) >= parseFloat(minRating));
    }

    // Only show available providers
    results = results.filter((r) => r.isAvailable !== false);

    // Skill / keyword search
    if (skill) {
      const re = new RegExp(skill, "i");
      results = results.filter(
        (r) =>
          re.test(r.userId?.name) ||
          (Array.isArray(r.skills) && r.skills.some((s) => re.test(s))) ||
          re.test(r.bio) ||
          re.test(r.category)
      );
    }

    // Geospatial distance filter (if lat/lng provided)
    if (lat && lng) {
      const radiusKm = parseFloat(radius) || 15;
      results = results.filter((r) => {
        const loc = r.userId?.location;
        if (!loc || !Array.isArray(loc.coordinates)) return true;
        const [rLng, rLat] = loc.coordinates;
        const dLat = (rLat - parseFloat(lat)) * (Math.PI / 180);
        const dLng = (rLng - parseFloat(lng)) * (Math.PI / 180);
        const a =
          Math.sin(dLat / 2) ** 2 +
          Math.cos(parseFloat(lat) * (Math.PI / 180)) *
            Math.cos(rLat * (Math.PI / 180)) *
            Math.sin(dLng / 2) ** 2;
        const distKm = 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return distKm <= radiusKm;
      });
    }

    // Sorting
    if (sort === "price_asc") {
      results.sort((a, b) => Number(a.hourlyRate) - Number(b.hourlyRate));
    } else if (sort === "price_desc") {
      results.sort((a, b) => Number(b.hourlyRate) - Number(a.hourlyRate));
    } else if (sort === "reviews") {
      results.sort((a, b) => Number(b.reviewCount) - Number(a.reviewCount));
    } else {
      results.sort((a, b) => Number(b.avgRating) - Number(a.avgRating));
    }

    const total = results.length;
    const paginated = results.slice(skipNum, skipNum + limitNum);

    res.json({
      data: paginated,
      pagination: {
        total,
        page: pageNum,
        pages: Math.ceil(total / limitNum) || 1,
        limit: limitNum,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get provider profile by user ID
// @route   GET /api/providers/:id
// @access  Public
const getProviderById = async (req, res) => {
  try {
    const profile = await ProviderProfile.findOne({ userId: req.params.id }).populate(
      "userId",
      "name email phone avatar location verified"
    );

    if (!profile) {
      return res.status(404).json({ message: "Provider profile not found" });
    }

    res.json({ data: profile });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create or update provider profile
// @route   POST /api/providers/profile
// @access  Private (Provider)
const updateProfile = async (req, res) => {
  const {
    bio,
    category,
    skills,
    skillDetails,
    hourlyRate,
    serviceRadius,
    experience,
    languages,
    isAvailable,
    availability,
  } = req.body;

  try {
    const profileFields = {
      bio,
      category,
      skills,
      ...(skillDetails !== undefined && { skillDetails }),
      hourlyRate,
      serviceRadius,
      experience,
      languages,
      isAvailable,
      availability,
    };

    const profile = await ProviderProfile.findOne({ userId: req.user._id });

    if (profile) {
      const updated = await ProviderProfile.findOneAndUpdate(
        { userId: req.user._id },
        profileFields,
        { new: true }
      );
      res.json({ data: updated });
    } else {
      profileFields.userId = req.user._id;
      const newProfile = await ProviderProfile.create(profileFields);
      res.json({ data: newProfile });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add image to portfolio
// @route   POST /api/providers/portfolio
// @access  Private (Provider)
const addPortfolioItem = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Portfolio image file is required" });
    }

    const profile = await ProviderProfile.findOne({ userId: req.user._id });
    if (!profile) {
      return res.status(404).json({ message: "Provider profile not found" });
    }

    let fileUrl = req.file.path;
    if (!req.file.path.startsWith("http")) {
      const baseUrl = `${req.protocol}://${req.get("host")}`;
      fileUrl = `${baseUrl}/uploads/${req.file.filename}`;
    }

    const newPortfolioItem = { url: fileUrl, caption: req.body.caption || "" };
    profile.portfolio = [...(profile.portfolio || []), newPortfolioItem];

    await profile.save();
    res.status(201).json({ data: profile });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete image from portfolio
// @route   DELETE /api/providers/portfolio/:id
// @access  Private (Provider)
const deletePortfolioItem = async (req, res) => {
  try {
    const profile = await ProviderProfile.findOne({ userId: req.user._id });
    if (!profile) {
      return res.status(404).json({ message: "Provider profile not found" });
    }

    profile.portfolio = (profile.portfolio || []).filter(
      (item) => item._id?.toString() !== req.params.id && item.id?.toString() !== req.params.id
    );
    await profile.save();

    res.json({ data: profile });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Submit verification request
// @route   POST /api/providers/verify
// @access  Private (Provider)
const submitVerification = async (req, res) => {
  try {
    const { idDocumentType, skillDocumentDescription } = req.body;

    if (!req.files || !req.files.idDocument) {
      return res.status(400).json({ message: "ID document upload is required" });
    }

    const profile = await ProviderProfile.findOne({ userId: req.user._id });
    if (!profile) {
      return res.status(404).json({ message: "Provider profile not found" });
    }

    const idFile = req.files.idDocument[0];
    let idUrl = idFile.path;
    if (!idUrl.startsWith("http")) {
      idUrl = `${req.protocol}://${req.get("host")}/uploads/${idFile.filename}`;
    }

    let skillUrl = "";
    if (req.files.skillDocument) {
      const skillFile = req.files.skillDocument[0];
      skillUrl = skillFile.path;
      if (!skillUrl.startsWith("http")) {
        skillUrl = `${req.protocol}://${req.get("host")}/uploads/${skillFile.filename}`;
      }
    }

    const verification = await Verification.create({
      userId: req.user._id,
      idDocumentType,
      idDocumentUrl: idUrl,
      skillDocumentDescription: skillDocumentDescription || "",
      skillDocumentUrl: skillUrl,
      status: "pending",
    });

    profile.verificationStatus = "pending";
    await profile.save();

    res.status(201).json({
      message: "Verification request submitted successfully",
      data: verification,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  searchProviders,
  getProviderById,
  updateProfile,
  addPortfolioItem,
  deletePortfolioItem,
  submitVerification,
};
