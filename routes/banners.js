const express = require("express");
const router = express.Router();
const {
  addBanner,
  getAll,
  updateBanner,
  deleteBanner,
} = require("../controllers/banners");
const { uploadImage } = require("../controllers/upload");

const auth = require("../middleware/auth");
const protectRoute = require("../middleware/protectRoutes");

router.get("/", getAll);
router.post(
  "/",
  auth,
  protectRoute(["admin"]),
  uploadImage.single("file"),
  addBanner
);
router.put("/", auth, protectRoute(["admin"]), updateBanner);
router.delete("/:id", auth, protectRoute(["admin"]), deleteBanner);

module.exports = router;
