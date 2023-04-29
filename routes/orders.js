const express = require("express");
const router = express.Router();
const {
  getAll,
  submitOrder,
  agentsGetPendingOrders,
  acceptPendingOrder,
  agentsGetAcceptedOrders,
  ridersGetPendingOrders,
  ridersGetWaitingOrders,
  acceptWaitingForDeliveryOrder,
  rejectWaitingForDeliveryOrder,
  finishOrderDelivery,
  ridersGetCompletedOrders,
  agentSendAcceptedOrder,
  agentsGetCompletedOrders,
  adminGetAll,
} = require("../controllers/orders");

const auth = require("../middleware/auth");
const protectRoute = require("../middleware/protectRoutes");

router.get("/", auth, getAll);
router.get("/admin", auth, protectRoute(["admin"]), adminGetAll);
router.get("/pending", auth, protectRoute(["agents"]), agentsGetPendingOrders);
router.get(
  "/riders/pending",
  auth,
  protectRoute(["riders"]),
  ridersGetPendingOrders
);
router.get("/waiting", auth, protectRoute(["riders"]), ridersGetWaitingOrders);
router.get(
  "/accepted",
  auth,
  protectRoute(["agents"]),
  agentsGetAcceptedOrders
);
router.post("/", auth, submitOrder);
router.post("/accept", auth, protectRoute(["agents"]), acceptPendingOrder);
router.post(
  "/sendorder",
  auth,
  protectRoute(["agents"]),
  agentSendAcceptedOrder
);
router.post(
  "/riders/accept",
  auth,
  protectRoute(["riders"]),
  acceptWaitingForDeliveryOrder
);
router.post(
  "/riders/reject",
  auth,
  protectRoute(["riders"]),
  rejectWaitingForDeliveryOrder
);

router.post(
  "/riders/finish",
  auth,
  protectRoute(["riders"]),
  finishOrderDelivery
);

router.get(
  "/completed",
  auth,
  protectRoute(["agents"]),
  agentsGetCompletedOrders
);
router.get(
  "/riders/completed",
  auth,
  protectRoute(["riders"]),
  ridersGetCompletedOrders
);

module.exports = router;
