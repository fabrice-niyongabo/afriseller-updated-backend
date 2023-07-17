const express = require("express");
const router = express.Router();
const {
  addTowishList,
  removeFromwishList,
  getAll,
} = require("../controllers/wishlist");

const auth = require("../middleware/auth");

router.get("/", auth, getAll);
router.post("/", auth, addTowishList);
router.delete("/:id", auth, removeFromwishList);

module.exports = router;
