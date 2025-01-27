const express = require("express");
const router = express.Router();
const chatService = require("../service/chatService");
const { verifyToken } = require("../middleware/verifyToken");

router.post("/chats", verifyToken, chatService.createChat);
router.get("/users/chats", verifyToken, chatService.getUserChats);
router.post("/chats/messages", verifyToken, chatService.storeMessage);
router.get("/chats/messages", verifyToken, chatService.getConversation);
router.post("/chats/requests", verifyToken, chatService.createRequest);
router.patch("/chats/requests", verifyToken, chatService.updateRequest);
router.get("/chats/requests", verifyToken, chatService.getRequests);

module.exports = router;
