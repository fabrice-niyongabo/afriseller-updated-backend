const express = require("express");
const router = express.Router();
const {
  getAll,
  addRequestedServices,
  adminAll,
  deleteRequestedServices,
  updateRequestedServices,
  addRequestedServiceFiles,
  deleteRequestedServicesFile,
  getRequestedServicesFiles,
} = require("../controllers/requestedServices");

const auth = require("../middleware/auth");
const protectRoute = require("../middleware/protectRoutes");
const { uploadFile } = require("../controllers/upload");

router.get("/", auth, getAll);
router.get("/all", auth, protectRoute(["admin"]), adminAll);
router.get("/files/:id", auth, getRequestedServicesFiles);
router.put("/", auth, protectRoute(["admin"]), updateRequestedServices);
router.post("/", auth, addRequestedServices);
router.post(
  "/files",
  auth,
  uploadFile.single("file"),
  addRequestedServiceFiles
);
router.delete("/:id", auth, deleteRequestedServices);
router.delete("/files/:id", auth, deleteRequestedServices);

module.exports = router;
