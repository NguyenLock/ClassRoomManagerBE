const express = require("express");
const router = express.Router();
const chatController = require("../controllers/chatController");
const authMiddleware = require("../middlewares/authMiddleware");

router.get("/chat", authMiddleware, chatController.getChat);

module.exports = router;