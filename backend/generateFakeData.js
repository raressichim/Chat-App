const { faker } = require("@faker-js/faker");
const db = require("./db_config/dbInit");
const bcrypt = require("bcrypt");
const { normalizeEmail } = require("validator");
const hashPassword = async (password) => {
  const saltRounds = 10;
  return await bcrypt.hash(password, saltRounds);
};

async function generateUsers(count = 10) {
  const users = [];
  for (let i = 0; i < count; i++) {
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    const username = faker.internet
      .username({ firstName, lastName })
      .toLowerCase();
    const password = await hashPassword("");
    users.push({
      email: normalizeEmail(faker.internet.email({ firstName, lastName })),
      firstName,
      lastName,
      password,
      username,
    });
  }
  return users;
}

async function generateChats(users, count = 5) {
  const chats = [];
  for (let i = 0; i < count; i++) {
    const isGroup = faker.datatype.boolean();
    const chat = {
      createdAt: new Date(),
      isGroup,
      name: isGroup ? faker.lorem.words(2) : null,
      users: faker.helpers.arrayElements(
        users.map((u) => u.username),
        { min: 2, max: 5 }
      ),
    };
    chat.messages = await generateMessages(chat.users);
    chats.push(chat);
  }
  return chats;
}

async function generateMessages(users) {
  const messages = [];
  const messageCount = faker.number.int({ min: 5, max: 20 });
  for (let i = 0; i < messageCount; i++) {
    messages.push({
      createdAt: new Date(),
      sender: faker.helpers.arrayElement(users),
      text: faker.lorem.sentence(),
    });
  }
  return messages;
}

async function generateChatRequests(users, count = 5) {
  const chatRequests = [];
  for (let i = 0; i < count; i++) {
    const sender = faker.helpers.arrayElement(users).username;
    let receiver = faker.helpers.arrayElement(users).username;
    while (receiver === sender) {
      receiver = faker.helpers.arrayElement(users).username;
    }
    chatRequests.push({
      createdAt: new Date(),
      receiver,
      sender,
      status: faker.helpers.arrayElement(["accepted", "pending"]),
    });
  }
  return chatRequests;
}

async function insertUsersIntoFirestore(users) {
  try {
    for (const user of users) {
      await db.collection("users").add(user);
    }
    console.log(`${users.length} users inserted successfully.`);
  } catch (error) {
    console.error("Error inserting users:", error);
  }
}

async function insertChatsIntoFirestore(chats) {
  try {
    for (const chat of chats) {
      const chatRef = await db.collection("chats").add({
        createdAt: chat.createdAt,
        isGroup: chat.isGroup,
        name: chat.name,
        users: chat.users,
      });

      for (const message of chat.messages) {
        await chatRef.collection("messages").add(message);
      }
    }
    console.log(
      `${chats.length} chats and their messages inserted successfully.`
    );
  } catch (error) {
    console.error("Error inserting chats:", error);
  }
}

async function insertChatRequestsIntoFirestore(chatRequests) {
  try {
    for (const request of chatRequests) {
      await db.collection("chatRequests").add(request);
    }
    console.log(`${chatRequests.length} chat requests inserted successfully.`);
  } catch (error) {
    console.error("Error inserting chat requests:", error);
  }
}

async function generateAndInsertFakeData() {
  try {
    const users = await generateUsers(10);
    const chats = await generateChats(users, 15);
    const chatRequests = await generateChatRequests(users, 5);

    await insertUsersIntoFirestore(users);
    await insertChatsIntoFirestore(chats);
    await insertChatRequestsIntoFirestore(chatRequests);

    console.log("All data inserted successfully!");
  } catch (error) {
    console.error("Error generating or inserting data:", error);
  }
}

generateAndInsertFakeData();
