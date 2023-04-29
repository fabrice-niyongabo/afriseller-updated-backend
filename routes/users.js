const express = require("express");
const router = express.Router();
const { uploadImage } = require("../controllers/upload");
const {
  login,
  register,
  getClientsList,
  updateInfo,
  updatePwd,
  updateImage,
  adminGetAll,
  updateUserStatus,
  googleLogin,
  googleRegister,
} = require("../controllers/users");

const auth = require("../middleware/auth");
const protectRoute = require("../middleware/protectRoutes");

router.post("/login", login);
router.post("/register", register);
router.get("/", auth, protectRoute(["admin"]), adminGetAll);
router.put("/", auth, protectRoute(["admin"]), updateUserStatus);
router.put("/pwd", auth, protectRoute(["client", "admin"]), updatePwd);
router.put("/info", auth, protectRoute(["client", "admin"]), updateInfo);
router.put(
  "/image",
  auth,
  protectRoute(["client", "admin"]),
  uploadImage.single("file"),
  updateImage
);

module.exports = router;
