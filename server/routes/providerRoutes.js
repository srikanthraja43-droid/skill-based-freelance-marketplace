const express = require("express");
const router = express.Router();
const {
  searchProviders,
  getProviderById,
  updateProfile,
  addPortfolioItem,
  deletePortfolioItem,
  submitVerification,
} = require("../controllers/providerController");
const { protect, authorize } = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");

router.get("/search", searchProviders);
router.get("/:id", getProviderById);

router.post("/profile", protect, authorize("provider"), updateProfile);

router.post(
  "/portfolio",
  protect,
  authorize("provider"),
  upload.single("image"),
  addPortfolioItem
);

router.delete(
  "/portfolio/:id",
  protect,
  authorize("provider"),
  deletePortfolioItem
);

router.post(
  "/verify",
  protect,
  authorize("provider"),
  upload.fields([
    { name: "idDocument", maxCount: 1 },
    { name: "skillDocument", maxCount: 1 },
  ]),
  submitVerification
);

module.exports = router;
