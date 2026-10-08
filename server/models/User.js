const bcrypt = require("bcryptjs");
const dbStore = require("./supabaseAdapter");

class UserDoc {
  constructor(data) {
    Object.assign(this, data);
    this._id = data._id || data.id;
    this.id = this._id;
    this.refreshTokens = data.refreshTokens || [];
    this.location = data.location || { type: "Point", coordinates: [0, 0], address: "", city: "" };
    this.isActive = data.isActive !== undefined ? data.isActive : true;
    this.verified = data.verified || false;
  }

  async comparePassword(enteredPassword) {
    if (!this.password) return false;
    return await bcrypt.compare(enteredPassword, this.password);
  }

  async save() {
    if (this.password && !this.password.startsWith("$2a$") && !this.password.startsWith("$2b$")) {
      const salt = await bcrypt.genSalt(10);
      this.password = await bcrypt.hash(this.password, salt);
    }
    const updated = await dbStore.table("users").update({ _id: this._id }, this);
    return this;
  }

  toObject() {
    const obj = { ...this };
    delete obj.password;
    return obj;
  }
}

const User = {
  create: async (userData) => {
    let password = userData.password;
    if (password && !password.startsWith("$2a$") && !password.startsWith("$2b$")) {
      const salt = await bcrypt.genSalt(10);
      password = await bcrypt.hash(password, salt);
    }

    const payload = {
      name: userData.name,
      email: userData.email?.toLowerCase(),
      password,
      role: userData.role || "client",
      phone: userData.phone || "",
      avatar: userData.avatar || "",
      location: userData.location || { type: "Point", coordinates: [0, 0], address: "", city: "" },
      isActive: userData.isActive !== undefined ? userData.isActive : true,
      verified: userData.verified || false,
      refreshTokens: userData.refreshTokens || [],
    };

    const inserted = await dbStore.table("users").insert(payload);
    return new UserDoc(inserted);
  },

  findOne: (query) => {
    return {
      select: (selectStr) => ({
        exec: async () => User.findOne(query),
        then: (resolve) => User.findOne(query).then(resolve),
      }),
      then: async (resolve) => {
        const users = await dbStore.table("users").select();
        let found = users.find((u) => {
          if (query.email && u.email?.toLowerCase() !== query.email.toLowerCase()) return false;
          if (query.refreshTokens && (!u.refreshTokens || !u.refreshTokens.includes(query.refreshTokens))) return false;
          return true;
        });
        const res = found ? new UserDoc(found) : null;
        return resolve ? resolve(res) : res;
      },
    };
  },

  findById: (id) => {
    const fetch = async () => {
      const users = await dbStore.table("users").select();
      const found = users.find((u) => u._id === id || u.id === id);
      return found ? new UserDoc(found) : null;
    };

    return {
      select: () => ({
        then: (resolve) => fetch().then(resolve),
      }),
      then: (resolve) => fetch().then(resolve),
    };
  },

  findByIdAndUpdate: async (id, update) => {
    await dbStore.table("users").update({ _id: id }, update);
    return await User.findById(id);
  },

  find: (query = {}) => {
    const execute = async () => {
      let users = await dbStore.table("users").select();
      if (query.$or) {
        users = users.filter((u) => {
          return query.$or.some((cond) => {
            if (cond.name && cond.name.$regex) {
              const re = new RegExp(cond.name.$regex, cond.name.$options || "");
              if (re.test(u.name)) return true;
            }
            if (cond.email && cond.email.$regex) {
              const re = new RegExp(cond.email.$regex, cond.email.$options || "");
              if (re.test(u.email)) return true;
            }
            return false;
          });
        });
      } else if (query.role) {
        users = users.filter((u) => u.role === query.role);
      }
      return users.map((u) => new UserDoc(u));
    };

    return {
      sort: () => ({
        then: (resolve) => execute().then(resolve),
      }),
      then: (resolve) => execute().then(resolve),
    };
  },

  countDocuments: async (query = {}) => {
    const users = await User.find(query);
    return users.length;
  },

  aggregate: async (pipeline) => {
    // Basic compatibility aggregate for searchProviders and admin stats
    const users = await dbStore.table("users").select();
    const profiles = await dbStore.table("provider_profiles").select();

    const results = users
      .filter((u) => u.role === "provider" && u.isActive !== false)
      .map((u) => {
        const profile = profiles.find((p) => p.userId === u._id || p.userId === u.id) || {
          category: "Other",
          skills: [],
          bio: "",
          hourlyRate: 0,
          avgRating: 0,
          reviewCount: 0,
          totalBookings: 0,
          isAvailable: true,
        };
        return {
          ...profile,
          _id: profile._id || profile.id,
          userId: {
            _id: u._id,
            name: u.name,
            email: u.email,
            phone: u.phone,
            avatar: u.avatar,
            location: u.location,
            verified: u.verified,
          },
        };
      });

    return results;
  },
};

module.exports = User;
