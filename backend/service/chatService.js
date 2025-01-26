const db = require("../db_config/dbInit");

const createChat = async (req, res) => {
  const { users, name } = req.body;
  try {
    if (!users || users.length < 2) {
      return res.status(400).json({
        error: "At least two users are required for creating a chat.",
      });
    }
    if (users.length === 2) {
      const foundChat = await findChat(users[0], users[1]);
      if (foundChat) {
        console.log("Chat already exists");
        return res.status(200).json({
          chatId: foundChat,
        });
      }
    }

    const newChat = {
      users,
      name: users.length > 2 ? name : null,
      isGroup: users.length > 2,
      createdAt: new Date(),
    };

    const addedChat = await db.collection("chats").add(newChat);

    const chatDoc = await addedChat.get();
    const chatData = chatDoc.data();

    console.log("New chat created with ID: ", addedChat.id);
    console.log("New chat data: ", chatData);

    res.status(201).json({
      chatId: addedChat.id,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json(err);
  }
};

const findChat = async (firstUsername, secondUsername) => {
  const chatRef = db.collection("chats");
  const query = chatRef
    .where("isGroup", "==", false)
    .where("users", "array-contains", firstUsername);
  const snapshot = await query.get();

  for (const doc of snapshot.docs) {
    const chatData = doc.data();

    if (chatData.users.includes(secondUsername)) {
      return doc.id;
    }
  }
  return null;
};

const getUserChats = async (req, res) => {
  const username = req.query.username;
  if (!username) {
    return res
      .status(400)
      .send({ message: "There is no username for getting other users" });
  }
  try {
    const chatRef = db.collection("chats");
    const query = chatRef.where("users", "array-contains", username);

    const snapshot = await query.get();

    const chats = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    res.status(200).json({ chats });
  } catch (err) {
    console.log(err);
    return res.status(500).json(err);
  }
};

const sendMessage = async (data, onlineUsers, io) => {
  const message = data.message;
  const chatDocRef = db.collection("chats").doc(message.chatId);
  const chatDoc = await chatDocRef.get();

  if (!chatDoc.exists) {
    console.error("Chat document does not exist.");
    return;
  }

  const chatData = chatDoc.data();

  chatData.users.forEach((username) => {
    const recipient = onlineUsers.find((user) => user.username === username);
    if (recipient) {
      io.to(recipient.socketId).emit("getMessage", message);
    }
  });
};

const storeMessage = async (req, res) => {
  const message = req.body.message;
  console.log(message);
  try {
    const chatDocRef = db.collection("chats").doc(message.chatId);
    const chatDoc = await chatDocRef.get();
    if (!chatDoc.exists) {
      console.error("Chat document does not exist. Creating it now.");
      await chatDocRef.set({
        users: message.users,
        createdAt: new Date(),
        isGroup: message.users > 2,
      });
    }

    const messageRef = chatDocRef.collection("messages");
    const newMessageRef = await messageRef.add({
      text: message.text,
      sender: message.sender,
      createdAt: new Date(),
    });

    console.log("Message successfully added with ID:", newMessageRef.id);
    res.status(200).json({ messageId: newMessageRef.id });
  } catch (err) {
    console.error("Error storing message:", err);
  }
};

const getConversation = async (req, res) => {
  const { chatId } = req.query;
  try {
    if (chatId) {
      const messagesRef = db
        .collection("chats")
        .doc(chatId)
        .collection("messages");
      const snapshot = await messagesRef.orderBy("createdAt", "asc").get();
      const messages = [];
      snapshot.forEach((doc) => {
        messages.push({ id: doc.id, ...doc.data() });
      });
      res.status(200).json({ messages });
    } else {
      console.error("Chat not found");
      res.status(404).json({ error: "Chat not found" });
    }
  } catch (err) {
    console.error("Internal server error occured when getting the messages");
    res
      .status(500)
      .json("Internal server error occured when getting the messages");
  }
};

module.exports = {
  createChat,
  getUserChats,
  findChat,
  sendMessage,
  storeMessage,
  getConversation,
};
