const express = require("express");
const router = express.Router();
const {
  register,
  getVerification,
  updateDocument,
  updateIdNumber,
  updateImage,
  adminGetAll,
  udpateShop,
  getAllShops,
} = require("../controllers/shops");
const { uploadImage } = require("../controllers/upload");
const auth = require("../middleware/auth");
const protectRoute = require("../middleware/protectRoutes");

router.get("/all", auth, protectRoute(["admin"]), adminGetAll);

router.post("/register", auth, register);
router.get("/verification", auth, protectRoute(["suppliers"]), getVerification);
router.put(
  "/doc",
  auth,
  protectRoute(["suppliers"]),
  uploadImage.single("file"),
  updateDocument
);
router.put(
  "/image",
  auth,
  protectRoute(["suppliers"]),
  uploadImage.single("file"),
  updateImage
);

router.get("/", auth, getAllShops);

module.exports = router;
