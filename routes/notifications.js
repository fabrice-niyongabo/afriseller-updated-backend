const express = require("express");
const router = express.Router();
const {
  getAgentNotifications,
  getRiderNotifications,
  getAdminNotifications,
  getClientNotifications,
  deleteAgentNotification,
  deleteRiderNotification,
  deleteAdminNotification,
  deleteClientNotification,
  agentsClearAll,
  riderClearAll,
  adminClearAll,
  clientClearAll,
  readNotifications,
} = require("../controllers/notifications");

const auth = require("../middleware/auth");
const protectRoute = require("../middleware/protectRoutes");

router.get("/agent", auth, getAgentNotifications);
router.get("/rider", auth, getRiderNotifications);
router.get("/admin", auth, protectRoute(["admin"]), getAdminNotifications);
router.get("/client", auth, getClientNotifications);
router.delete("/agent/:id", auth, deleteAgentNotification);
router.delete("/rider/:id", auth, deleteRiderNotification);
router.delete(
  "/admin/:id",
  auth,
  protectRoute(["admin"]),
  deleteAdminNotification
);
router.delete("/client/:id", auth, deleteClientNotification);
router.delete("/agent", auth, agentsClearAll);
router.delete("/rider", auth, riderClearAll);
router.delete("/admin", auth, protectRoute(["admin"]), adminClearAll);
router.delete("/client", auth, clientClearAll);
router.get("/read", auth, readNotifications);

module.exports = router;
