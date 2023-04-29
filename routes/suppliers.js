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
  getSuppliersList,
  adminGetAll,
  updateSupplier,
} = require("../controllers/suppliers");
const { uploadImage } = require("../controllers/upload");
const auth = require("../middleware/auth");
const protectRoute = require("../middleware/protectRoutes");

router.get("/", auth, protectRoute(["admin"]), adminGetAll);
router.put("/", auth, protectRoute(["admin"]), updateSupplier);

router.post("/login", login);
router.post("/register", uploadImage.single("file"), register);
router.get("/verification", auth, protectRoute(["suppliers"]), getVerification);
router.put(
  "/doc",
  auth,
  protectRoute(["suppliers"]),
  uploadImage.single("file"),
  updateDocument
);
router.put("/idno", auth, protectRoute(["suppliers"]), updateIdNumber);
router.put("/pwd", auth, protectRoute(["suppliers"]), updatePwd);
router.put("/info", auth, protectRoute(["suppliers"]), updateInfo);
router.put("/status", auth, protectRoute(["suppliers"]), updateStatus);
router.put(
  "/image",
  auth,
  protectRoute(["suppliers"]),
  uploadImage.single("file"),
  updateImage
);

router.get("/list", auth, getSuppliersList);

module.exports = router;
