const db = require("../db_config/dbInit");

const createChat = async (req, res) => {
  const { firstId, secondId } = req.body;
  try {
    const foundChat = await findChat(firstId, secondId);
    if (foundChat) {
      return res.status(200).json({
        chatId: foundChat,
      });
    }

    const newChat = {
      firstId: firstId,
      secondId: secondId,
      createdAt: new Date(),
    };

    const addedChat = await db.collection("chats").add(newChat);

    const chatDoc = await addedChat.get();
    const chatData = chatDoc.data();

    console.log("New chat created with ID: ", addedChat.id);
    console.log("New chat data: ", chatData);

    res.status(201).json({
      id: addedChat.id,
      ...addedChat,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json(err);
  }
};

const findChat = async (firstId, secondId) => {
  const chatRef = db.collection("chats");
  const query1 = chatRef
    .where("firstId", "==", firstId)
    .where("secondId", "==", secondId);

  const query2 = chatRef
    .where("firstId", "==", secondId)
    .where("secondId", "==", firstId);

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
  const { userId } = req.params;
  try {
    const chatRef = db.collection("chats");
    const query1 = chatRef.where("firstId", "==", userId).get();
    const query2 = chatRef.where("secondId", "==", userId).get();

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

module.exports = {
  createChat,
  getUserChats,
  findChat,
};
