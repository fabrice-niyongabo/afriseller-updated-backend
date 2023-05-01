const express = require("express");
const router = express.Router();
const {
  addProduct,
  adminAll,
  getAll,
  updateProduct,
  deleteProduct,
  getSingleProductPrices,
  getAllPrices,
  addPrice,
  updatePrice,
  deletePrice,
  getMine,
  updateImage,
  updateProductStatus,
} = require("../controllers/products");
const { uploadImage } = require("../controllers/upload");

const auth = require("../middleware/auth");
const protectRoute = require("../middleware/protectRoutes");

router.get("/", getAll);
router.get("/mine", auth, getMine);
router.get("/admin/", auth, protectRoute(["admin"]), adminAll);
router.post("/", auth, uploadImage.single("file"), addProduct);
router.put("/", auth, updateProduct);
router.put("/image", auth, uploadImage.single("file"), updateImage);
router.put("/status", auth, updateProductStatus);
router.delete("/:id", auth, protectRoute(["seller"]), deleteProduct);
router.get("/prices/supplier/:id", getAllPrices);
router.get("/prices/:id", getSingleProductPrices);
router.post("/prices/", auth, addPrice);
router.put("/prices/", auth, protectRoute(["admin"]), updatePrice);
router.delete("/prices/:id", auth, deletePrice);

module.exports = router;
