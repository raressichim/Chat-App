const express = require("express");
const router = express.Router();
const chatService = require("../service/chatService");
const { verifyToken } = require("../middleware/verifyToken");

router.post("/chats", verifyToken, chatService.createChat);
router.get("/users/chats", verifyToken, chatService.getUserChats);
router.post("/chats/messages", verifyToken, chatService.storeMessage);
router.get("/chats/messages", verifyToken, chatService.getConversation);

module.exports = router;
