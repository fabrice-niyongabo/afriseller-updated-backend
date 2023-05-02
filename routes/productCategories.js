const express = require("express");
const router = express.Router();
const {
  addCategory,
  getAll,
  updateCategory,
  deleteCategory,
  getOne,
  updateImage,
  updateBanner,
  toggleCategory,
} = require("../controllers/productCategories");
const { uploadImage } = require("../controllers/upload");

const auth = require("../middleware/auth");
const protectRoute = require("../middleware/protectRoutes");

router.get("/", getAll);
router.get("/:id", getOne);
router.post("/", auth, protectRoute(["admin"]), addCategory);
router.put("/", auth, protectRoute(["admin"]), updateCategory);
router.put("/toggle", auth, protectRoute(["admin"]), toggleCategory);
router.put(
  "/image",
  auth,
  protectRoute(["admin"]),
  uploadImage.single("file"),
  updateImage
);
router.put(
  "/banner",
  auth,
  protectRoute(["admin"]),
  uploadImage.single("file"),
  updateBanner
);
router.delete("/:id", auth, protectRoute(["admin"]), deleteCategory);

module.exports = router;
