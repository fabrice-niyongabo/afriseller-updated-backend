const express = require("express");
const router = express.Router();
const {
  getAll,
  submitPaymentRequest,
  deletePayment,
  adminGetAll,
  rejectPayment,
  approvePayment,
  adminGetAllFromApp,
} = require("../controllers/suppliersPayment");

const auth = require("../middleware/auth");
const protectRoute = require("../middleware/protectRoutes");
const { uploadImage } = require("../controllers/upload");

router.get("/", auth, getAll);
router.get("/all", auth, protectRoute(["admin"]), adminGetAll);
router.get("/all/app", auth, protectRoute(["admin"]), adminGetAllFromApp);
router.post("/", auth, submitPaymentRequest);
router.post("/reject", auth, protectRoute(["admin"]), rejectPayment);
router.post(
  "/pay",
  auth,
  protectRoute(["admin"]),
  uploadImage.single("file"),
  approvePayment
);
router.delete("/:id", auth, deletePayment);

module.exports = router;
