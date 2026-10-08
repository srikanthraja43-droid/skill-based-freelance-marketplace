const dbStore = require("./supabaseAdapter");

/**
 * ProviderProfile Document Class
 * Represents an individual provider profile with helper methods and computed properties.
 */
class ProviderProfileDoc {
  constructor(data = {}) {
    Object.assign(this, data);
    this._id = data._id || data.id;
    this.id = this._id;
    this.userId = data.userId || data.user_id;
    this.category = data.category || "Other";
    this.skills = Array.isArray(data.skills) ? data.skills : [];
    this.skillDetails = Array.isArray(data.skillDetails)
      ? data.skillDetails
      : Array.isArray(data.skill_details)
        ? data.skill_details
        : [];
    this.bio = data.bio || "";
    this.hourlyRate = Number(data.hourlyRate !== undefined ? data.hourlyRate : data.hourly_rate || 0);
    this.serviceRadius = Number(data.serviceRadius !== undefined ? data.serviceRadius : data.service_radius || 10);
    this.experience = Number(data.experience || 0);
    this.languages = Array.isArray(data.languages) ? data.languages : ["English"];
    this.portfolio = Array.isArray(data.portfolio) ? data.portfolio : [];
    this.avgRating = Number(data.avgRating !== undefined ? data.avgRating : data.avg_rating || 0);
    this.reviewCount = Number(data.reviewCount !== undefined ? data.reviewCount : data.review_count || 0);
    this.totalBookings = Number(data.totalBookings !== undefined ? data.totalBookings : data.total_bookings || 0);
    this.verificationStatus = data.verificationStatus || data.verification_status || "unverified";
    this.isAvailable = data.isAvailable !== undefined ? Boolean(data.isAvailable) : data.is_available !== undefined ? Boolean(data.is_available) : true;
    this.isFeatured = data.isFeatured !== undefined ? Boolean(data.isFeatured) : Boolean(data.is_featured);
    this.featuredTitle = data.featuredTitle || data.featured_title || "";
    this.isPopular = data.isPopular !== undefined ? Boolean(data.isPopular) : Boolean(data.is_popular);
    this.responseTime = data.responseTime || data.response_time || "Within 1 hour";
    this.responseRate = Number(data.responseRate !== undefined ? data.responseRate : 98);
    this.availability = data.availability || {
      monday: true,
      tuesday: true,
      wednesday: true,
      thursday: true,
      friday: true,
      saturday: false,
      sunday: false,
      startTime: "09:00",
      endTime: "18:00",
    };
  }

  // --- Feature: Save updates to database ---
  async save() {
    const plainData = this.toObject();
    await dbStore.table("provider_profiles").update({ _id: this._id }, plainData);
    return this;
  }

  // --- Feature: Dynamic Badge Calculator ---
  getBadge() {
    if (this.verificationStatus === "verified" && this.avgRating >= 4.8 && this.totalBookings >= 10) {
      return { label: "Top Rated Pro", color: "#635BFF", bg: "#EEF2FF", icon: "⭐" };
    }
    if (this.verificationStatus === "verified") {
      return { label: "Verified Expert", color: "#16A34A", bg: "#F0FDF4", icon: "✓" };
    }
    if (this.totalBookings >= 5 && this.avgRating >= 4.5) {
      return { label: "Rising Talent", color: "#0284C7", bg: "#F0F9FF", icon: "🚀" };
    }
    if (this.isPopular) {
      return { label: "Popular", color: "#EA580C", bg: "#FFF7ED", icon: "🔥" };
    }
    return { label: "Freelancer", color: "#64748B", bg: "#F8FAFC", icon: "💼" };
  }

  // --- Feature: Availability Checker ---
  isAvailableOn(dateOrDay, timeStr) {
    if (!this.isAvailable) return false;
    let dayName;
    if (dateOrDay instanceof Date) {
      const days = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
      dayName = days[dateOrDay.getDay()];
    } else if (typeof dateOrDay === "string") {
      dayName = dateOrDay.toLowerCase();
    }

    if (dayName && this.availability[dayName] === false) {
      return false;
    }

    if (timeStr && this.availability.startTime && this.availability.endTime) {
      return timeStr >= this.availability.startTime && timeStr <= this.availability.endTime;
    }

    return true;
  }

  // --- Feature: Review & Rating Increment Helper ---
  async recordReview(newRating) {
    const currentTotal = this.avgRating * this.reviewCount;
    this.reviewCount += 1;
    this.avgRating = Math.round(((currentTotal + Number(newRating)) / this.reviewCount) * 10) / 10;
    return await this.save();
  }

  // --- Feature: Portfolio Management Helpers ---
  async addPortfolioItem(item) {
    const id = item._id || item.id || Date.now().toString();
    const portfolioItem = {
      _id: id,
      id,
      url: item.url,
      caption: item.caption || "",
      title: item.title || "",
      createdAt: new Date().toISOString(),
    };
    this.portfolio.push(portfolioItem);
    return await this.save();
  }

  async removePortfolioItem(itemId) {
    this.portfolio = this.portfolio.filter((p) => p._id !== itemId && p.id !== itemId);
    return await this.save();
  }

  // --- Serialization Helper ---
  toObject() {
    return {
      _id: this._id,
      id: this.id,
      userId: this.userId,
      category: this.category,
      skills: this.skills,
      skillDetails: this.skillDetails,
      bio: this.bio,
      hourlyRate: this.hourlyRate,
      serviceRadius: this.serviceRadius,
      experience: this.experience,
      languages: this.languages,
      portfolio: this.portfolio,
      avgRating: this.avgRating,
      reviewCount: this.reviewCount,
      totalBookings: this.totalBookings,
      verificationStatus: this.verificationStatus,
      isAvailable: this.isAvailable,
      isFeatured: this.isFeatured,
      featuredTitle: this.featuredTitle,
      isPopular: this.isPopular,
      availability: this.availability,
      responseTime: this.responseTime,
      responseRate: this.responseRate,
      badge: this.getBadge(),
    };
  }

  toJSON() {
    return this.toObject();
  }
}

/**
 * Universal matcher for queries against provider profiles.
 * Correctly matches _id, id, userId, and other query attributes.
 */
const matchesQuery = (profile, query = {}) => {
  for (const [key, value] of Object.entries(query)) {
    if (value === undefined) continue;

    if (key === "_id" || key === "id") {
      const pId = profile._id || profile.id;
      const qId = typeof value === "object" && value !== null ? value.toString() : value;
      if (pId !== qId && pId?.toString() !== qId?.toString()) return false;
    } else if (key === "userId" || key === "user_id") {
      const pUid = typeof profile.userId === "object" && profile.userId !== null
        ? profile.userId._id || profile.userId.id
        : profile.userId || profile.user_id;
      const qUid = typeof value === "object" && value !== null
        ? value._id || value.id || value.toString()
        : value;
      if (pUid !== qUid && pUid?.toString() !== qUid?.toString()) return false;
    } else if (typeof value === "boolean") {
      if (Boolean(profile[key]) !== value) return false;
    } else if (profile[key] !== value) {
      return false;
    }
  }
  return true;
};

/**
 * Populates the userId field on a profile document.
 */
const populateUserId = async (profile, fieldsStr = "") => {
  if (!profile) return null;
  const uid = typeof profile.userId === "object" && profile.userId !== null
    ? profile.userId._id || profile.userId.id
    : profile.userId;

  if (uid) {
    const User = require("./User");
    const user = await User.findById(uid);
    if (user) {
      let userObj = user.toObject ? user.toObject() : { ...user };
      if (fieldsStr && typeof fieldsStr === "string") {
        const allowed = fieldsStr.split(/\s+/).filter(Boolean);
        const filtered = { _id: userObj._id, id: userObj.id };
        allowed.forEach((f) => {
          if (userObj[f] !== undefined) filtered[f] = userObj[f];
        });
        userObj = filtered;
      }
      profile.userId = userObj;
    }
  }
  return profile;
};

/**
 * Creates a standard Mongoose-compatible chainable query object.
 */
const createQueryBuilder = (executor) => {
  let populateOptions = null;
  let sortOption = null;
  let limitNum = null;
  let skipNum = null;

  const builder = {
    populate: (field, fieldsStr) => {
      populateOptions = { field, fieldsStr };
      return builder;
    },
    select: () => builder,
    sort: (option) => {
      sortOption = option;
      return builder;
    },
    limit: (n) => {
      limitNum = n;
      return builder;
    },
    skip: (n) => {
      skipNum = n;
      return builder;
    },
    lean: () => builder,
    exec: async () => {
      let result = await executor();
      if (!result) return null;

      if (Array.isArray(result)) {
        if (sortOption) {
          if (typeof sortOption === "object") {
            const [k, dir] = Object.entries(sortOption)[0] || [];
            if (k) {
              result.sort((a, b) => (dir === -1 || dir === "desc" ? b[k] - a[k] : a[k] - b[k]));
            }
          }
        }
        if (skipNum) result = result.slice(skipNum);
        if (limitNum) result = result.slice(0, limitNum);

        if (populateOptions && populateOptions.field === "userId") {
          result = await Promise.all(result.map((p) => populateUserId(p, populateOptions.fieldsStr)));
        }
        return result;
      }

      if (populateOptions && populateOptions.field === "userId") {
        result = await populateUserId(result, populateOptions.fieldsStr);
      }
      return result;
    },
    then: (resolve, reject) => {
      return builder.exec().then(resolve, reject);
    },
    catch: (reject) => {
      return builder.exec().catch(reject);
    },
  };

  return builder;
};

/**
 * ProviderProfile Model Object
 */
const ProviderProfile = {
  create: async (data = {}) => {
    const payload = {
      userId: data.userId || data.user_id,
      category: data.category || "Other",
      skills: data.skills || [],
      skillDetails: data.skillDetails || data.skill_details || [],
      bio: data.bio || "",
      hourlyRate: Number(data.hourlyRate !== undefined ? data.hourlyRate : data.hourly_rate || 0),
      serviceRadius: Number(data.serviceRadius !== undefined ? data.serviceRadius : data.service_radius || 10),
      experience: Number(data.experience || 0),
      languages: data.languages || ["English"],
      availability: data.availability || {
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
      portfolio: data.portfolio || [],
      avgRating: Number(data.avgRating !== undefined ? data.avgRating : data.avg_rating || 0),
      reviewCount: Number(data.reviewCount !== undefined ? data.reviewCount : data.review_count || 0),
      totalBookings: Number(data.totalBookings !== undefined ? data.totalBookings : data.completedJobs || 0),
      verificationStatus: data.verificationStatus || (data.isVerified ? "verified" : "unverified"),
      isAvailable: data.isAvailable !== undefined ? Boolean(data.isAvailable) : true,
      isFeatured: data.isFeatured !== undefined ? Boolean(data.isFeatured) : Boolean(data.is_featured),
      featuredTitle: data.featuredTitle || data.featured_title || "",
      isPopular: data.isPopular !== undefined ? Boolean(data.isPopular) : Boolean(data.is_popular),
      responseTime: data.responseTime || "Within 1 hour",
      responseRate: Number(data.responseRate !== undefined ? data.responseRate : 98),
    };

    const inserted = await dbStore.table("provider_profiles").insert(payload);
    return new ProviderProfileDoc(inserted);
  },

  findOne: (query = {}) => {
    const fetch = async () => {
      const profiles = await dbStore.table("provider_profiles").select();
      const found = profiles.find((p) => matchesQuery(p, query));
      return found ? new ProviderProfileDoc(found) : null;
    };

    return createQueryBuilder(fetch);
  },

  findById: (id) => {
    return ProviderProfile.findOne({ _id: id });
  },

  find: (query = {}) => {
    const fetch = async () => {
      const profiles = await dbStore.table("provider_profiles").select();
      const filtered = profiles.filter((p) => matchesQuery(p, query));
      return filtered.map((p) => new ProviderProfileDoc(p));
    };

    return createQueryBuilder(fetch);
  },

  findOneAndUpdate: async (query, update, _options = {}) => {
    const profile = await ProviderProfile.findOne(query);
    if (!profile) return null;

    let updateFields = {};

    // 1. Process standard fields
    if (update.$set) {
      Object.assign(updateFields, update.$set);
    } else {
      for (const [k, v] of Object.entries(update)) {
        if (!k.startsWith("$")) {
          updateFields[k] = v;
        }
      }
    }

    // 2. Process $inc operators
    if (update.$inc) {
      for (const [k, v] of Object.entries(update.$inc)) {
        updateFields[k] = (Number(profile[k]) || 0) + Number(v);
      }
    }

    // 3. Process $push operators
    if (update.$push) {
      for (const [k, v] of Object.entries(update.$push)) {
        const list = Array.isArray(profile[k]) ? [...profile[k]] : [];
        list.push(v);
        updateFields[k] = list;
      }
    }

    // 4. Update in database
    await dbStore.table("provider_profiles").update({ _id: profile._id }, updateFields);

    // Return the updated document if requested (default behavior)
    return await ProviderProfile.findOne(query);
  },

  findByIdAndUpdate: async (id, update, options = {}) => {
    return await ProviderProfile.findOneAndUpdate({ _id: id }, update, options);
  },

  findByIdAndDelete: async (id) => {
    const profile = await ProviderProfile.findOne({ _id: id });
    if (!profile) return null;
    if (dbStore.inMemoryStore?.provider_profiles) {
      dbStore.inMemoryStore.provider_profiles = dbStore.inMemoryStore.provider_profiles.filter(
        (p) => p._id !== id && p.id !== id
      );
    }
    return profile;
  },

  countDocuments: async (query = {}) => {
    const profiles = await dbStore.table("provider_profiles").select();
    return profiles.filter((p) => matchesQuery(p, query)).length;
  },

  // --- Extra Static Feature Helpers ---
  findFeatured: (limit = 6) => {
    return ProviderProfile.find({ isFeatured: true }).limit(limit).populate("userId");
  },

  findPopular: (limit = 8) => {
    return ProviderProfile.find({ isPopular: true }).limit(limit).populate("userId");
  },

  findByCategory: (category) => {
    return ProviderProfile.find({ category }).populate("userId");
  },
};

module.exports = ProviderProfile;
