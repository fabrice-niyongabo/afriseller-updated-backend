const express = require("express");
const router = express.Router();
const {
  register,
  getVerification,
  updateDocument,
  updateShopImage,
  adminGetAll,
  udpateShop,
  getAllShops,
  getMyShop,
} = require("../controllers/shops");
const { uploadImage } = require("../controllers/upload");
const auth = require("../middleware/auth");
const protectRoute = require("../middleware/protectRoutes");

router.get("/all", auth, protectRoute(["admin"]), adminGetAll);

router.post("/register", auth, register);
router.get("/verification", auth, protectRoute(["suppliers"]), getVerification);
router.put("/", auth, udpateShop);
router.put(
  "/doc",
  auth,
  protectRoute(["suppliers"]),
  uploadImage.single("file"),
  updateDocument
);
router.put("/shopimage", auth, uploadImage.single("file"), updateShopImage);

router.get("/", getAllShops);
router.get("/mine", auth, getMyShop);

module.exports = router;
