const express = require("express");
const router = express.Router();
const {
  getAll,
  adminAll,
  updateBooking,
  addBooking,
} = require("../controllers/booking");

const auth = require("../middleware/auth");
const protectRoute = require("../middleware/protectRoutes");

router.get("/", getAll);
router.post("/", auth, protectRoute(["admin"]), addFees);
router.put("/", auth, protectRoute(["admin"]), updateFees);
router.delete("/:id", auth, protectRoute(["admin"]), deleteFee);

module.exports = router;
