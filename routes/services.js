const express = require("express");
const router = express.Router();
const {
  getAll,
  getOne,
  updateImage,
  addService,
  deleteService,
  updateService,
  adminGetAll,
} = require("../controllers/services");
const { uploadImage } = require("../controllers/upload");

const auth = require("../middleware/auth");
const protectRoute = require("../middleware/protectRoutes");

router.get("/", getAll);
router.get("/all", auth, protectRoute(["admin"]), adminGetAll);
router.get("/:id", getOne);
router.post(
  "/",
  auth,
  protectRoute(["admin"]),
  uploadImage.single("file"),
  addService
);
router.put("/", auth, protectRoute(["admin"]), updateService);
router.put(
  "/image",
  auth,
  protectRoute(["admin"]),
  uploadImage.single("file"),
  updateImage
);
router.delete("/:id", auth, protectRoute(["admin"]), deleteService);

module.exports = router;
