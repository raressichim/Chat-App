const express = require("express");
const app = express();
const httpLogger = require("morgan");
const cors = require("cors");
const port = 3000;
const userRouter = require("./controller/userController");
const chatRouter = require("./controller/chatController");
const chatService = require("./service/chatService");
const cookieParser = require("cookie-parser");
const http = require("http");
const { Server } = require("socket.io");

app.use(
  cors({
    origin: "http://localhost:8080",
    credentials: true,
  })
);
app.use(httpLogger("dev"));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cookieParser());
app.use(userRouter, chatRouter);

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" },
});

let onlineUsers = [];

io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);
  socket.on("addNewUser", (username) => {
    !onlineUsers.some((user) => user.username === username) &&
      onlineUsers.push({
        username,
        socketId: socket.id,
      });
    socket.username = username;
    io.emit("getOnlineUsers", onlineUsers);
  });

  socket.on("sendMessage", async (messageData) => {
    messageData.message.sender = socket.username;
    socket.broadcast
      .to(messageData.message.chatId)
      .emit("receiveMessage", messageData);
    await chatService.sendMessage(messageData, onlineUsers, io);
  });

  socket.on("logout", (username) => {
    onlineUsers = onlineUsers.filter((user) => user.username !== username);
    io.emit("getOnlineUsers", onlineUsers);
    console.log(`User ${username} logged out`);
  });

  socket.on("disconnect", () => {
    onlineUsers = onlineUsers.filter((user) => user.socketId !== socket.id);
    io.emit("getOnlineUsers", onlineUsers);
    console.log("User disconnected");
  });
});

app.get("/", (req, res) => {
  res.send("Hello World!");
});

server.listen(port, () => {
  console.log(`Messenger app running on port ${port}!`);
});
