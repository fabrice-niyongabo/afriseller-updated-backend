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
  updateProductStatus,
  getMySingleProduct,
  addProductImage,
  deleteProductImage,
  toggleProduct,
} = require("../controllers/products");
const { uploadImage } = require("../controllers/upload");

const auth = require("../middleware/auth");
const protectRoute = require("../middleware/protectRoutes");

router.get("/", getAll);
router.get("/mine/:id", auth, protectRoute(["seller"]), getMySingleProduct);
router.get("/mine", auth, getMine);
router.get("/admin/", auth, protectRoute(["admin"]), adminAll);
router.post("/", auth, uploadImage.single("file"), addProduct);
router.put("/", auth, updateProduct);
router.put("/toggle", auth, toggleProduct);
router.post(
  "/image",
  auth,
  protectRoute(["admin", "seller"]),
  uploadImage.single("file"),
  addProductImage
);
router.delete("/image/:id", auth, protectRoute(["seller"]), deleteProductImage);
router.put("/status", auth, updateProductStatus);
router.delete("/:id", auth, protectRoute(["seller"]), deleteProduct);
router.get("/prices/supplier/:id", getAllPrices);
router.get("/prices/:id", getSingleProductPrices);
router.post("/prices/", auth, addPrice);
router.put("/prices/", auth, protectRoute(["seller"]), updatePrice);
router.delete("/prices/:id", auth, deletePrice);

module.exports = router;
