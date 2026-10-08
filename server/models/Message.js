const dbStore = require("./supabaseAdapter");

class MessageDoc {
  constructor(data) {
    Object.assign(this, data);
    this._id = data._id || data.id;
    this.id = this._id;
    this.isRead = data.isRead || false;
  }

  async save() {
    await dbStore.table("messages").update({ _id: this._id }, this);
    return this;
  }
}

const populateUsers = async (msg) => {
  if (!msg) return null;
  const User = require("./User");
  const doc = new MessageDoc(msg);

  if (doc.senderId && typeof doc.senderId === "string") {
    const sender = await User.findById(doc.senderId);
    if (sender) doc.senderId = sender.toObject ? sender.toObject() : sender;
  }

  if (doc.receiverId && typeof doc.receiverId === "string") {
    const receiver = await User.findById(doc.receiverId);
    if (receiver) doc.receiverId = receiver.toObject ? receiver.toObject() : receiver;
  }

  return doc;
};

const Message = {
  create: async (data) => {
    const payload = {
      conversationId: data.conversationId,
      senderId: data.senderId,
      receiverId: data.receiverId,
      text: data.text,
      isRead: data.isRead || false,
    };
    const inserted = await dbStore.table("messages").insert(payload);
    return new MessageDoc(inserted);
  },

  find: (query = {}) => {
    const fetch = async () => {
      let msgs = await dbStore.table("messages").select();
      if (query.conversationId) {
        msgs = msgs.filter((m) => m.conversationId === query.conversationId);
      }
      msgs.sort((a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0));
      return Promise.all(msgs.map(populateUsers));
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
      const msgs = await dbStore.table("messages").select();
      const found = msgs.find((m) => m._id === id || m.id === id);
      return found ? new MessageDoc(found) : null;
    };

    const chainable = {
      populate: () => chainable,
      then: async (resolve) => {
        const found = await fetch();
        const populated = await populateUsers(found);
        return resolve ? resolve(populated) : populated;
      },
    };

    return chainable;
  },

  updateMany: async (filter, update) => {
    return await dbStore.table("messages").update(filter, update.$set || update);
  },
};

module.exports = Message;
