const User = require("../models/User");
const ProviderProfile = require("../models/ProviderProfile");
const Verification = require("../models/Verification");

// @desc    Search providers with filters & geospatial distance
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

    const pipeline = [];

    // 1. Geospatial near stage if coordinates provided
    if (lat && lng) {
      const radiusInMeters = (parseFloat(radius) || 15) * 1000;
      pipeline.push({
        $geoNear: {
          near: { type: "Point", coordinates: [parseFloat(lng), parseFloat(lat)] },
          distanceField: "distance",
          maxDistance: radiusInMeters,
          query: { role: "provider", isActive: true },
          spherical: true,
        },
      });
    } else {
      pipeline.push({
        $match: { role: "provider", isActive: true },
      });
    }

    // 2. Lookup Provider Profile
    pipeline.push({
      $lookup: {
        from: "providerprofiles",
        localField: "_id",
        foreignField: "userId",
        as: "profile",
      },
    });

    // Unwind profile
    pipeline.push({
      $unwind: "$profile",
    });

    // 3. Match filters on Profile
    const matchFilters = {};

    if (category) {
      matchFilters["profile.category"] = category;
    }

    if (minRate) {
      matchFilters["profile.hourlyRate"] = { ...matchFilters["profile.hourlyRate"], $gte: parseFloat(minRate) };
    }
    if (maxRate) {
      matchFilters["profile.hourlyRate"] = { ...matchFilters["profile.hourlyRate"], $lte: parseFloat(maxRate) };
    }

    if (minRating) {
      matchFilters["profile.avgRating"] = { $gte: parseFloat(minRating) };
    }

    // Only search available providers
    matchFilters["profile.isAvailable"] = true;

    if (Object.keys(matchFilters).length > 0) {
      pipeline.push({ $match: matchFilters });
    }

    // 4. Skill / Bio / Name keyword match
    if (skill) {
      pipeline.push({
        $match: {
          $or: [
            { name: { $regex: skill, $options: "i" } },
            { "profile.skills": { $regex: skill, $options: "i" } },
            { "profile.bio": { $regex: skill, $options: "i" } },
            { "profile.category": { $regex: skill, $options: "i" } },
          ],
        },
      });
    }

    // 5. Structure mapping: Replace root so we return ProviderProfiles with userId populated
    pipeline.push({
      $replaceRoot: {
        newRoot: {
          $mergeObjects: [
            "$profile",
            {
              userId: {
                _id: "$_id",
                name: "$name",
                email: "$email",
                phone: "$phone",
                avatar: "$avatar",
                location: "$location",
                verified: "$verified",
              },
            },
          ],
        },
      },
    });

    // 6. Sort stage
    let sortStage = {};
    if (sort === "price_asc") {
      sortStage = { hourlyRate: 1 };
    } else if (sort === "price_desc") {
      sortStage = { hourlyRate: -1 };
    } else if (sort === "reviews") {
      sortStage = { reviewCount: -1 };
    } else {
      // Default to avgRating top rated
      sortStage = { avgRating: -1 };
    }
    pipeline.push({ $sort: sortStage });

    // Execute aggregation clone for pagination count
    const countPipeline = [...pipeline];
    countPipeline.push({ $count: "total" });
    const countResult = await User.aggregate(countPipeline);
    const total = countResult[0]?.total || 0;

    // Apply pagination
    pipeline.push({ $skip: skipNum });
    pipeline.push({ $limit: limitNum });

    const results = await User.aggregate(pipeline);

    res.json({
      data: results,
      pagination: {
        total,
        page: pageNum,
        pages: Math.ceil(total / limitNum),
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
    hourlyRate,
    serviceRadius,
    experience,
    languages,
    isAvailable,
    availability,
  } = req.body;

  try {
    let profile = await ProviderProfile.findOne({ userId: req.user._id });

    const profileFields = {
      bio,
      category,
      skills,
      hourlyRate,
      serviceRadius,
      experience,
      languages,
      isAvailable,
      availability,
    };

    if (profile) {
      // Update
      profile = await ProviderProfile.findOneAndUpdate(
        { userId: req.user._id },
        { $set: profileFields },
        { new: true }
      );
    } else {
      // Create
      profileFields.userId = req.user._id;
      profile = await ProviderProfile.create(profileFields);
    }

    res.json({ data: profile });
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

    // Determine URL (Local file path vs Cloudinary absolute URL)
    let fileUrl = req.file.path;
    if (!req.file.path.startsWith("http")) {
      const baseUrl = `${req.protocol}://${req.get("host")}`;
      fileUrl = `${baseUrl}/uploads/${req.file.filename}`;
    }

    profile.portfolio.push({
      url: fileUrl,
      caption: req.body.caption || "",
    });

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

    profile.portfolio = profile.portfolio.filter((item) => item._id.toString() !== req.params.id);
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

    // Save Verification Request
    const verification = await Verification.create({
      userId: req.user._id,
      idDocumentType,
      idDocumentUrl: idUrl,
      skillDocumentDescription: skillDocumentDescription || "",
      skillDocumentUrl: skillUrl,
      status: "pending",
    });

    // Update Profile status
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
