const dbStore = require("./supabaseAdapter");

class VerificationDoc {
  constructor(data) {
    Object.assign(this, data);
    this._id = data._id || data.id;
    this.id = this._id;
    this.status = data.status || "pending";
    this.adminNote = data.adminNote || "";
  }

  async save() {
    await dbStore.table("verifications").update({ _id: this._id }, this);
    return this;
  }
}

const Verification = {
  create: async (data) => {
    const payload = {
      userId: data.userId,
      idDocumentType: data.idDocumentType,
      idDocumentUrl: data.idDocumentUrl,
      skillDocumentDescription: data.skillDocumentDescription || "",
      skillDocumentUrl: data.skillDocumentUrl || "",
      status: data.status || "pending",
      adminNote: data.adminNote || "",
    };
    const inserted = await dbStore.table("verifications").insert(payload);
    return new VerificationDoc(inserted);
  },

  find: (query = {}) => {
    const fetch = async () => {
      let items = await dbStore.table("verifications").select();
      if (query.status) {
        items = items.filter((v) => v.status === query.status);
      }
      items.sort((a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0));

      const User = require("./User");
      return Promise.all(
        items.map(async (v) => {
          const doc = new VerificationDoc(v);
          if (doc.userId && typeof doc.userId === "string") {
            const user = await User.findById(doc.userId);
            if (user) doc.userId = user.toObject ? user.toObject() : user;
          }
          return doc;
        })
      );
    };

    const chainable = {
      sort: () => chainable,
      populate: () => chainable,
      then: (resolve) => fetch().then(resolve),
    };

    return chainable;
  },

  findById: async (id) => {
    const items = await dbStore.table("verifications").select();
    const found = items.find((v) => v._id === id || v.id === id);
    return found ? new VerificationDoc(found) : null;
  },

  countDocuments: async (query = {}) => {
    const items = await dbStore.table("verifications").select();
    const filtered = items.filter((v) => {
      if (query.status && v.status !== query.status) return false;
      return true;
    });
    return filtered.length;
  },
};

module.exports = Verification;
