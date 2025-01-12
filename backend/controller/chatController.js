const express = require("express");
const router = express.Router();
const chatService = require("../service/chatService");

router.post("/chats", chatService.createChat);
router.get("/users/:userId/chats", chatService.getUserChats);

module.exports = router;
