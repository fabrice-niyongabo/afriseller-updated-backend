const express = require("express");
const router = express.Router();
const {
  addCategory,
  getAll,
  updateCategory,
  deleteCategory,
} = require("../controllers/shopCategories");
const { uploadImage } = require("../controllers/upload");

const auth = require("../middleware/auth");
const protectRoute = require("../middleware/protectRoutes");

router.get("/", getAll);
router.post(
  "/",
  auth,
  protectRoute(["admin"]),
  uploadImage.single("file"),
  addCategory
);
router.put("/", auth, protectRoute(["admin"]), updateCategory);
router.delete("/:id", auth, protectRoute(["admin"]), deleteCategory);

module.exports = router;
