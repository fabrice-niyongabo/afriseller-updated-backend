const express = require("express");
const router = express.Router();
const {
  getAll,
  addRequestedServices,
  adminAll,
  deleteRequestedServices,
  updateRequestedServices,
} = require("../controllers/requestedServices");

const auth = require("../middleware/auth");
const protectRoute = require("../middleware/protectRoutes");

router.get("/", auth, getAll);
router.get("/all/", auth, protectRoute(["admin"]), adminAll);
router.put("/", auth, protectRoute(["admin"]), updateRequestedServices);
router.post("/", auth, addRequestedServices);
router.delete("/:id", auth, deleteRequestedServices);

module.exports = router;
