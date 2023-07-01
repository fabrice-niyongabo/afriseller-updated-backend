const express = require("express");
const router = express.Router();
const { getAll, updateCountry } = require("../controllers/countries");

const auth = require("../middleware/auth");
const protectRoute = require("../middleware/protectRoutes");

router.get("/", getAll);
router.put("/", auth, protectRoute(["admin"]), updateCountry);

module.exports = router;
