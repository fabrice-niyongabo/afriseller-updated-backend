const express = require("express");
const router = express.Router();
const {
  login,
  register,
  getVerification,
  updateDocument,
  updateIdNumber,
  updatePwd,
  updateInfo,
  updateStatus,
  updateImage,
  adminGetAll,
  updateRider,
  updatePosition,
  adminGetSingle,
} = require("../controllers/riders");
const { uploadImage } = require("../controllers/upload");

const auth = require("../middleware/auth");
const protectRoute = require("../middleware/protectRoutes");

router.post("/login", login);
router.post("/register", uploadImage.single("file"), register);
router.get("/verification", auth, getVerification);
router.put("/doc", auth, uploadImage.single("file"), updateDocument);
router.put("/idno", auth, updateIdNumber);
router.put("/pwd", auth, updatePwd);
router.put("/info", auth, updateInfo);
router.put("/position", auth, updatePosition);
router.put("/status", auth, updateStatus);
router.put("/image", auth, uploadImage.single("file"), updateImage);
router.get("/", auth, protectRoute(["admin"]), adminGetAll);
router.put("/", auth, protectRoute(["admin"]), updateRider);
router.get("/:id", auth, protectRoute(["admin"]), adminGetSingle);

module.exports = router;
