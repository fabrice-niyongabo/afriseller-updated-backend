const express = require("express");
const router = express.Router();
const { getAll, addOrUpdateToken } = require("../controllers/appTokens");
const { uploadImage } = require("../controllers/upload");

const auth = require("../middleware/auth");
const protectRoute = require("../middleware/protectRoutes");

router.get("/", auth, protectRoute(["admin"]), getAll);
router.post("/", addOrUpdateToken);

module.exports = router;
