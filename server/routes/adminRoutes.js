const express = require("express");
const router = express.Router();
const {
  getStats,
  getUsers,
  toggleUserActiveState,
  getPendingVerifications,
  reviewVerification,
} = require("../controllers/adminController");
const { protect, authorize } = require("../middleware/authMiddleware");

// All admin routes require admin privileges
router.use(protect, authorize("admin"));

router.get("/stats", getStats);
router.get("/users", getUsers);
router.patch("/users/:id/ban", toggleUserActiveState);
router.get("/verifications", getPendingVerifications);
router.patch("/verifications/:id", reviewVerification);

module.exports = router;
