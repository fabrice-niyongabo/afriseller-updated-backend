const express = require("express");
const router = express.Router();
const {
  getSingle,
  addEstimation,
  updateEstimation,
  deleteEstimation,
  adminAll,
} = require("../controllers/shippingEstimations");
const auth = require("../middleware/auth");
const protectRoute = require("../middleware/protectRoutes");

router.get("/:id", getSingle);
router.get("/all", auth, protectRoute(["admin"]), adminAll);

router.post("/", auth, addEstimation);
router.put("/", auth, updateEstimation);
router.delete("/:id", auth, deleteEstimation);

module.exports = router;
