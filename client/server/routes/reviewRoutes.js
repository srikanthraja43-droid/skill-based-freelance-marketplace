const express = require('express');
const router = express.Router();
const { createReview, getProviderReviews } = require('../controllers/reviewController');
const { protect, authorize } = require('../middleware/auth');

router.post('/', protect, authorize('client'), createReview);
router.get('/provider/:providerId', getProviderReviews);

module.exports = router;
