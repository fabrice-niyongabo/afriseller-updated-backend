const express = require("express");
const router = express.Router();
const {
  getAll,
  sendFileMessage,
  sendTextMessage,
  deleteMessage,
} = require("../controllers/messages");
const { uploadImage } = require("../controllers/upload");

const auth = require("../middleware/auth");
const protectRoute = require("../middleware/protectRoutes");

router.get("/", auth, getAll);
router.post("/", auth, sendTextMessage);
router.post("/image", auth, uploadImage.single("file"), sendFileMessage);
router.delete("/:id", auth, deleteMessage);

module.exports = router;
