const express = require("express");
const router = express.Router();
const { getAll, saveTransaction } = require("../controllers/transactions");

const auth = require("../middleware/auth");
const protectRoute = require("../middleware/protectRoutes");

router.get("/", auth, protectRoute(["admin"]), getAll);
router.post("/", saveTransaction);

module.exports = router;
