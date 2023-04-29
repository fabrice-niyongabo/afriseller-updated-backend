const express = require("express");
const router = express.Router();
const {
  getAll,
  addAgentsFees,
  updateAgentsFees,
} = require("../controllers/agentsFees");

const auth = require("../middleware/auth");
const protectRoute = require("../middleware/protectRoutes");

router.get("/", getAll);
router.post("/", auth, protectRoute(["admin"]), addAgentsFees);
router.put("/", auth, protectRoute(["admin"]), updateAgentsFees);

module.exports = router;
