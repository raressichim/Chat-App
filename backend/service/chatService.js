const db = require("../db_config/dbInit");

const createChat = async (req, res) => {
  const { senderEmail, recipientEmail } = req.body;
  try {
    const foundChat = await findChat(senderEmail, recipientEmail);
    if (foundChat) {
      return res.status(200).json({
        chatId: foundChat,
      });
    }

    const newChat = {
      firstEmail: senderEmail,
      secondEmail: recipientEmailEmail,
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

const findChat = async (firstEmail, secondEmail) => {
  const chatRef = db.collection("chats");
  const query1 = chatRef
    .where("firstEmail", "==", firstEmail)
    .where("secondEmail", "==", secondEmail);

  const query2 = chatRef
    .where("firstEmail", "==", secondEmail)
    .where("secondEmail", "==", firstEmail);

  const [snapshot1, snapshot2] = await Promise.all([
    query1.get(),
    query2.get(),
  ]);

  if (!snapshot1.empty || !snapshot2.empty) {
    console.log("Chat already exists");

    const existingChatSnapshot = !snapshot1.empty
      ? snapshot1.docs[0]
      : snapshot2.docs[0];
    const existingChatId = existingChatSnapshot.id;

    return existingChatId;
  }
  return null;
};

const getUserChats = async (req, res) => {
  const { userEmail } = req.params;
  try {
    const chatRef = db.collection("chats");
    const query1 = chatRef.where("firstEmail", "==", userEmail).get();
    const query2 = chatRef.where("secondEmail", "==", userEmail).get();

    const [snapshot1, snapshot2] = await Promise.all([query1, query2]);

    const chats = [
      ...snapshot1.docs.map((doc) => ({ id: doc.id, ...doc.data() })),
      ...snapshot2.docs.map((doc) => ({ id: doc.id, ...doc.data() })),
    ];

    res.status(200).json({ chats });
  } catch (err) {
    console.log(err);
    return res.status(500).json(err);
  }
};

const sendMessage = async (data, onlineUsers) => {
  const message = data.message;
  const recipient = onlineUsers.find(
    (user) => user.email === message.recipientEmail
  );
  console.log(recipient);

  if (recipient) {
    io.to(user.socketId).emit("getMessage", message);
  }
  console.log(message);
  try {
    console.log(message.chatId);
    const messageRef = db
      .collection("chats")
      .doc(message.chatId)
      .collection(chatRef, "messages");
    const newMessageRef = await messageRef.add({
      text: message.messageData,
      sender: message.senderEmail,
      createdAt: new Date(),
    });
    return newMessageRef.id;
  } catch (err) {
    console.log(err);
  }
};

module.exports = {
  createChat,
  getUserChats,
  findChat,
  sendMessage,
};
