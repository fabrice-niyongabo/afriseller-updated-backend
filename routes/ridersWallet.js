const express = require("express");
const router = express.Router();
const {
  getAll,
  withdraw,
  adminGetAll,
} = require("../controllers/ridersWallet");

const auth = require("../middleware/auth");
const protectRoute = require("../middleware/protectRoutes");

router.get("/", auth, protectRoute(["riders"]), getAll);
router.get("/all", auth, protectRoute(["admin"]), adminGetAll);
router.put("/", auth, protectRoute(["riders"]), withdraw);

module.exports = router;
