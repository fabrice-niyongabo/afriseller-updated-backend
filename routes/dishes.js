const express = require("express");
const router = express.Router();
const {
  getAll,
  addDish,
  updateDish,
  deleteDish,
  adminAll,
  getDishProducts,
  addDishProduct,
  deleteDishProduct,
} = require("../controllers/dishes");
const { uploadImage } = require("../controllers/upload");

const auth = require("../middleware/auth");
const protectRoute = require("../middleware/protectRoutes");

router.get("/", getAll);
router.get("/products/:id", getDishProducts);
router.get("/admin", auth, protectRoute(["admin"]), adminAll);
router.post(
  "/",
  auth,
  protectRoute(["admin"]),
  uploadImage.single("file"),
  addDish
);
router.post("/products", auth, protectRoute(["admin"]), addDishProduct);
router.put("/", auth, protectRoute(["admin"]), updateDish);
router.delete("/:id", auth, protectRoute(["admin"]), deleteDish);
router.delete(
  "/products/:id",
  auth,
  protectRoute(["admin"]),
  deleteDishProduct
);

module.exports = router;
