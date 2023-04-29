const express = require("express");
const router = express.Router();
const {
  login,
  register,
  getVerification,
  updateDocument,
  updateIdNumber,
  getMarketSubscriptions,
  subscribeToMarkets,
  unSubscribeToMarket,
  updatePwd,
  updateInfo,
  updateStatus,
  updateImage,
  verifyRider,
  getAgentsList,
  adminGetAll,
  updateAgent,
} = require("../controllers/agents");
const { uploadImage } = require("../controllers/upload");

const auth = require("../middleware/auth");
const protectRoute = require("../middleware/protectRoutes");

router.post("/login", login);
router.post(
  "/subscriptions",
  auth,
  protectRoute(["agents"]),
  subscribeToMarkets
);
router.post("/register", uploadImage.single("file"), register);
router.post("/verify", auth, protectRoute(["agents"]), verifyRider);
router.get("/verification", auth, protectRoute(["agents"]), getVerification);
router.get(
  "/subscriptions",
  auth,
  protectRoute(["agents"]),
  getMarketSubscriptions
);
router.put(
  "/doc",
  auth,
  protectRoute(["agents"]),
  uploadImage.single("file"),
  updateDocument
);
router.put("/idno", auth, protectRoute(["agents"]), updateIdNumber);
router.delete(
  "/subscriptions/:id",
  auth,
  protectRoute(["agents"]),
  unSubscribeToMarket
);
router.put("/pwd", auth, protectRoute(["agents"]), updatePwd);
router.put("/info", auth, protectRoute(["agents"]), updateInfo);
router.put("/status", auth, protectRoute(["agents"]), updateStatus);
router.put(
  "/image",
  auth,
  protectRoute(["agents"]),
  uploadImage.single("file"),
  updateImage
);

router.get("/list", auth, getAgentsList);
router.get("/", auth, protectRoute(["admin"]), adminGetAll);
router.put("/", auth, protectRoute(["admin"]), updateAgent);

module.exports = router;
