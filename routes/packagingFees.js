const express = require("express");
const router = express.Router();
const {
  getAll,
  addPackagingFees,
  updatePackagingFees,
} = require("../controllers/packagingFees");

const auth = require("../middleware/auth");
const protectRoute = require("../middleware/protectRoutes");

router.get("/", getAll);
router.post("/", auth, protectRoute(["admin"]), addPackagingFees);
router.put("/", auth, protectRoute(["admin"]), updatePackagingFees);

module.exports = router;
