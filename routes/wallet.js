const express = require("express");
const router = express.Router();
const { deposit, getAll } = require("../controllers/wallet");

const auth = require("../middleware/auth");
const protectRoute = require("../middleware/protectRoutes");

router.get("/", auth, getAll);
router.post("/", auth, deposit);
// router.post("/", auth, protectRoute(["admin"]), addFees);
// router.put("/", auth, protectRoute(["admin"]), updateFees);
// router.delete("/:id", auth, protectRoute(["admin"]), deleteFee);

module.exports = router;
