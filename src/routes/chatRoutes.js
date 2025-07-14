const express = require("express");
const router = express.Router();
const chatController = require("../controllers/chatController");
const authMiddleware = require("../middlewares/authMiddleware");

router.get("/", authMiddleware, chatController.getChat);
router.get("/history", authMiddleware, chatController.getChatHistory);

module.exports = router;