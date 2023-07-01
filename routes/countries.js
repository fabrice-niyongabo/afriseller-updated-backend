const express = require("express");
const router = express.Router();
const {
  getAll,
  updateCountry,
  adminGetAll,
} = require("../controllers/countries");

const auth = require("../middleware/auth");
const protectRoute = require("../middleware/protectRoutes");

router.get("/", getAll);
router.get("/all/", auth, protectRoute(["admin"]), adminGetAll);
router.put("/", auth, protectRoute(["admin"]), updateCountry);

module.exports = router;
