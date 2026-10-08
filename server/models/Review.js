const dbStore = require("./supabaseAdapter");

class ReviewDoc {
  constructor(data) {
    Object.assign(this, data);
    this._id = data._id || data.id;
    this.id = this._id;
    this.rating = Number(data.rating || 5);
    this.tags = data.tags || [];
  }

  async save() {
    await dbStore.table("reviews").update({ _id: this._id }, this);
    return this;
  }
}

const Review = {
  create: async (data) => {
    const payload = {
      bookingId: data.bookingId,
      reviewerId: data.reviewerId,
      providerId: data.providerId,
      rating: data.rating,
      comment: data.comment,
      tags: data.tags || [],
    };
    const inserted = await dbStore.table("reviews").insert(payload);
    return new ReviewDoc(inserted);
  },

  find: (query = {}) => {
    const fetch = async () => {
      let reviews = await dbStore.table("reviews").select();
      reviews = reviews.filter((r) => {
        if (query.providerId && r.providerId !== query.providerId && r.providerId?._id !== query.providerId) return false;
        return true;
      });
      reviews.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));

      const User = require("./User");
      const populated = await Promise.all(
        reviews.map(async (r) => {
          const doc = new ReviewDoc(r);
          if (doc.reviewerId) {
            const reviewer = await User.findById(doc.reviewerId);
            if (reviewer) doc.reviewerId = reviewer.toObject ? reviewer.toObject() : reviewer;
          }
          return doc;
        })
      );
      return populated;
    };

    const chainable = {
      sort: () => chainable,
      populate: () => chainable,
      then: (resolve) => fetch().then(resolve),
    };

    return chainable;
  },
};

module.exports = Review;
