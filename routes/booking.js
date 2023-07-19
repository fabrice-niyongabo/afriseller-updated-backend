const express = require("express");
const router = express.Router();
const {
  getAll,
  adminAll,
  updateBooking,
  addBooking,
  deleteBooking,
  getMine,
} = require("../controllers/booking");

const auth = require("../middleware/auth");
const protectRoute = require("../middleware/protectRoutes");

router.get("/", auth, getAll);
router.get("/:id", auth, protectRoute(["suppliers"]), getMine);
router.post("/", auth, addBooking);
router.put("/", auth, updateBooking);
router.delete("/:id", auth, deleteBooking);

module.exports = router;
