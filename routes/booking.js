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
router.post("/", auth, addBooking);
router.put("/", auth, updateBooking);
router.delete("/:id", auth, protectRoute(["admin"]), deleteFee);

module.exports = router;
