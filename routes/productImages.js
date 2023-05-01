const express = require("express");
const router = express.Router();
const {
  addImage,
  deleteProductImage,
} = require("../controllers/productImages");
const { uploadImage } = require("../controllers/upload");

const auth = require("../middleware/auth");
const protectRoute = require("../middleware/protectRoutes");

router.post("/", auth, uploadImage.single("file"), addImage);
router.delete("/:id", auth, deleteProductImage);

module.exports = router;
