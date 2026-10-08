const dbStore = require("./supabaseAdapter");

class ConversationDoc {
  constructor(data) {
    Object.assign(this, data);
    this._id = data._id || data.id;
    this.id = this._id;
    this.participants = data.participants || [];
    this.lastMessage = data.lastMessage || { text: "", senderId: null, timestamp: new Date() };
  }

  async save() {
    await dbStore.table("conversations").update({ _id: this._id }, this);
    return this;
  }
}

const populateParticipants = async (conversation) => {
  if (!conversation) return null;
  const User = require("./User");
  const doc = new ConversationDoc(conversation);

  if (Array.isArray(doc.participants)) {
    doc.participants = await Promise.all(
      doc.participants.map(async (pId) => {
        if (typeof pId === "string") {
          const u = await User.findById(pId);
          return u ? (u.toObject ? u.toObject() : u) : pId;
        }
        return pId;
      })
    );
  }
  return doc;
};

const Conversation = {
  create: async (data) => {
    const payload = {
      participants: data.participants || [],
      bookingId: data.bookingId || null,
      lastMessage: data.lastMessage || { text: "", senderId: null, timestamp: new Date() },
    };
    const inserted = await dbStore.table("conversations").insert(payload);
    return new ConversationDoc(inserted);
  },

  findOne: (query) => {
    const fetch = async () => {
      const convs = await dbStore.table("conversations").select();
      const found = convs.find((c) => {
        if (query.participants && query.participants.$all) {
          const reqParts = query.participants.$all.map((p) => p.toString());
          const hasAll = reqParts.every((pId) =>
            c.participants.some((part) => part.toString() === pId || part._id?.toString() === pId)
          );
          if (!hasAll) return false;
        }
        return true;
      });
      return found ? new ConversationDoc(found) : null;
    };

    return {
      populate: () => ({
        then: async (resolve) => {
          const found = await fetch();
          const populated = await populateParticipants(found);
          return resolve ? resolve(populated) : populated;
        },
      }),
      then: (resolve) => fetch().then(resolve),
    };
  },

  find: (query = {}) => {
    const fetch = async () => {
      let convs = await dbStore.table("conversations").select();
      if (query.participants) {
        const targetId = query.participants.toString();
        convs = convs.filter((c) =>
          c.participants.some((p) => p.toString() === targetId || p._id?.toString() === targetId)
        );
      }
      convs.sort((a, b) => new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0));
      return Promise.all(convs.map(populateParticipants));
    };

    const chainable = {
      sort: () => chainable,
      populate: () => chainable,
      then: (resolve) => fetch().then(resolve),
    };

    return chainable;
  },

  findById: (id) => {
    const fetch = async () => {
      const convs = await dbStore.table("conversations").select();
      const found = convs.find((c) => c._id === id || c.id === id);
      return found ? new ConversationDoc(found) : null;
    };

    const chainable = {
      populate: () => ({
        then: async (resolve) => {
          const found = await fetch();
          const populated = await populateParticipants(found);
          return resolve ? resolve(populated) : populated;
        },
      }),
      then: (resolve) => fetch().then(resolve),
    };

    return chainable;
  },
};

module.exports = Conversation;
