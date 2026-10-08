const dbStore = require("./supabaseAdapter");

class BookingDoc {
  constructor(data) {
    Object.assign(this, data);
    this._id = data._id || data.id;
    this.id = this._id;
    this.status = data.status || "pending";
    this.isReviewedByClient = data.isReviewedByClient || false;
    this.paymentStatus = data.paymentStatus || "unpaid";
    this.price = Number(data.price || 0);
  }

  async save() {
    await dbStore.table("bookings").update({ _id: this._id }, this);
    return this;
  }
}

const populateUsers = async (booking) => {
  if (!booking) return null;
  const User = require("./User");
  const doc = new BookingDoc(booking);

  if (doc.clientId && typeof doc.clientId === "string") {
    const client = await User.findById(doc.clientId);
    if (client) doc.clientId = client.toObject ? client.toObject() : client;
  }

  if (doc.providerId && typeof doc.providerId === "string") {
    const provider = await User.findById(doc.providerId);
    if (provider) doc.providerId = provider.toObject ? provider.toObject() : provider;
  }

  return doc;
};

const Booking = {
  create: async (data) => {
    const payload = {
      clientId: data.clientId,
      providerId: data.providerId,
      service: data.service,
      category: data.category,
      status: data.status || "pending",
      scheduledDate: data.scheduledDate,
      scheduledTime: data.scheduledTime,
      estimatedHours: data.estimatedHours || 1,
      price: data.price,
      notes: data.notes || "",
      rejectionReason: data.rejectionReason || "",
      cancellationReason: data.cancellationReason || "",
      isReviewedByClient: data.isReviewedByClient || false,
      paymentStatus: data.paymentStatus || "unpaid",
      paymentMethod: data.paymentMethod || "",
      transactionId: data.transactionId || "",
      invoiceNumber: data.invoiceNumber || "",
      paidAt: data.paidAt || null,
    };
    const inserted = await dbStore.table("bookings").insert(payload);
    return new BookingDoc(inserted);
  },

  find: (query = {}) => {
    let limitNum = null;

    const fetch = async () => {
      let bookings = await dbStore.table("bookings").select();
      bookings = bookings.filter((b) => {
        if (query.providerId && b.providerId !== query.providerId && b.providerId?._id !== query.providerId) return false;
        if (query.clientId && b.clientId !== query.clientId && b.clientId?._id !== query.clientId) return false;
        if (query.status && query.status !== "all" && b.status !== query.status) return false;
        return true;
      });

      // Sort createdAt desc
      bookings.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));

      if (limitNum) {
        bookings = bookings.slice(0, limitNum);
      }

      return Promise.all(bookings.map(populateUsers));
    };

    const chainable = {
      sort: () => chainable,
      limit: (n) => {
        limitNum = n;
        return chainable;
      },
      populate: () => chainable,
      then: (resolve) => fetch().then(resolve),
    };

    return chainable;
  },

  findById: (id) => {
    const fetch = async () => {
      const bookings = await dbStore.table("bookings").select();
      const found = bookings.find((b) => b._id === id || b.id === id);
      return found ? new BookingDoc(found) : null;
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

  countDocuments: async (query = {}) => {
    const bookings = await dbStore.table("bookings").select();
    const filtered = bookings.filter((b) => {
      if (query.status && b.status !== query.status) return false;
      if (query.paymentStatus && b.paymentStatus !== query.paymentStatus) return false;
      return true;
    });
    return filtered.length;
  },

  aggregate: async (pipeline) => {
    const bookings = await dbStore.table("bookings").select();

    // Check if grouping by status or revenue
    const isStatusGroup = pipeline.some((p) => p.$group && p.$group._id === "$status");
    if (isStatusGroup) {
      const map = {};
      bookings.forEach((b) => {
        map[b.status] = (map[b.status] || 0) + 1;
      });
      return Object.entries(map).map(([_id, count]) => ({ _id, count }));
    }

    const isRevenue = pipeline.some((p) => p.$match && p.$match.paymentStatus === "paid");
    if (isRevenue) {
      const totalVolume = bookings
        .filter((b) => b.paymentStatus === "paid")
        .reduce((sum, b) => sum + (Number(b.price) || 0), 0);
      return [{ _id: null, totalVolume }];
    }

    return [];
  },
};

module.exports = Booking;
