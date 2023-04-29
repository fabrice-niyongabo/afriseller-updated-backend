const express = require("express");
const router = express.Router();
const {
  getAll,
  addSystemFees,
  updateSystemFees,
} = require("../controllers/systemFees");

const auth = require("../middleware/auth");
const protectRoute = require("../middleware/protectRoutes");

router.get("/", getAll);
router.post("/", auth, protectRoute(["admin"]), addSystemFees);
router.put("/", auth, protectRoute(["admin"]), updateSystemFees);

module.exports = router;
