const express = require("express");
const router = express.Router();
const {
  getAll,
  withdraw,
  adminGetAll,
} = require("../controllers/agentsWallet");

const auth = require("../middleware/auth");
const protectRoute = require("../middleware/protectRoutes");

router.get("/", auth, protectRoute(["agents"]), getAll);
router.get("/all", auth, protectRoute(["admin"]), adminGetAll);
router.put("/", auth, protectRoute(["agents"]), withdraw);

module.exports = router;
