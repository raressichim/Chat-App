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

    return res.status(201).json({
      success: true,
      chatId: addedChat.id,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json(err);
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
  const username = req.username;
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
    return res.status(200).json({ chats });
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
  message.sender = req.username;
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
    return res.status(200).json({ messageId: newMessageRef.id });
  } catch (err) {
    console.error("Error storing message:", err);
    return res.status(500).json({ success: false, error: err.message });
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
      return res.status(200).json({ messages });
    } else {
      console.error("Chat not found");
      return res.status(404).json({ error: "Chat not found" });
    }
  } catch (err) {
    console.error("Internal server error occured when getting the messages");
    return res
      .status(500)
      .json("Internal server error occured when getting the messages");
  }
};

const createRequest = async (req, res) => {
  const { receiver } = req.body;
  const sender = req.username;
  const isSent = await checkRequestNotSent(sender, receiver);
  if (isSent) {
    return res.status(200).json({ message: "Request was already sent" });
  }
  try {
    const newRequest = {
      sender,
      receiver,
      status: "pending",
      createdAt: new Date(),
    };

    const addedRequest = await db.collection("chatRequests").add(newRequest);

    return res.status(201).json({ success: true, id: addedRequest.id });
  } catch (error) {
    console.error("Error creating chat request:", error);
    return res.status(500).json({ success: false, error: error.message });
  }
};

const updateRequest = async (req, res) => {
  const { requestId } = req.query;
  const { status } = req.body;

  if (!requestId || !status) {
    return res
      .status(400)
      .json({ success: false, message: "RequestId or status is missing" });
  }

  try {
    const chatRequestRef = db.collection("chatRequests").doc(requestId);
    const chatRequest = await chatRequestRef.get();

    if (!chatRequest.exists) {
      return res
        .status(404)
        .json({ success: false, message: "Chat request not found." });
    }

    const chatRequestData = chatRequest.data();
    const { sender, receiver } = chatRequestData;

    if (!sender || !receiver) {
      return res.status(400).json({
        success: false,
        message: "Sender or receiver is missing in chat request.",
      });
    }

    await chatRequestRef.update({ status });

    let chatId = null;
    if (status === "accepted") {
      const newChat = {
        users: [sender, receiver],
        isGroup: false,
        createdAt: new Date(),
      };

      const addedChat = await db.collection("chats").add(newChat);
      chatId = addedChat.id;

      console.log("New chat created with ID: ", chatId);
    }

    return res.status(200).json({ success: true, chatId });
  } catch (error) {
    console.error("Error updating chat request:", error);

    if (!res.headersSent) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }
};

const getRequests = async (req, res) => {
  const username = req.username;
  try {
    if (!username) {
      return res.status(404).json({
        success: false,
        message: "Username was not found when getting requests.",
      });
    }

    const chatRequestsRef = db
      .collection("chatRequests")
      .where("receiver", "==", username)
      .where("status", "==", "pending");

    const snapshot = await chatRequestsRef.get();

    const chatRequests = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return res.status(200).json(chatRequests);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, error: error.message });
  }
};

const checkRequestNotSent = async (sender, receiver) => {
  try {
    console.log("Receiver: " + receiver);
    console.log("Sender: " + sender);
    const requestRef = db.collection("chatRequests");
    const querySnapshot = await requestRef
      .where("receiver", "==", receiver)
      .where("sender", "==", sender)
      .where("status", "in", ["pending", "accepted"])
      .limit(1)
      .get();

    if (!querySnapshot.empty) {
      return true;
    }

    return false;
  } catch (error) {
    console.error("Error checking chat request:", error);
    throw error;
  }
};

module.exports = {
  createChat,
  getUserChats,
  findChat,
  sendMessage,
  storeMessage,
  getConversation,
  createRequest,
  updateRequest,
  getRequests,
  checkRequestNotSent,
};
