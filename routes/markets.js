const express = require("express");
const router = express.Router();
const {
  addMarket,
  adminAll,
  getAll,
  updateMarket,
  deleteMarket,
} = require("../controllers/markets");
const { uploadImage } = require("../controllers/upload");

const auth = require("../middleware/auth");
const protectRoute = require("../middleware/protectRoutes");

router.get("/", getAll);
router.get("/admin/", auth, protectRoute(["admin"]), adminAll);
router.post(
  "/",
  auth,
  protectRoute(["admin"]),
  uploadImage.single("file"),
  addMarket
);
router.put("/", auth, protectRoute(["admin"]), updateMarket);
router.delete("/:id", auth, protectRoute(["admin"]), deleteMarket);

module.exports = router;
