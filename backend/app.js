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

  socket.on("addNewUser", (email) => {
    !onlineUsers.some((user) => user.email === email) &&
      onlineUsers.push({
        email,
        socketId: socket.id,
      });

    io.emit("getOnlineUsers", onlineUsers);
  });

  socket.on("sendMessage", async (message) => {
    socket.broadcast.to(message.chatId).emit("receiveMessage", message);
    await chatService.sendMessage(message, onlineUsers, io);
  });

  socket.on("logout", (email) => {
    onlineUsers = onlineUsers.filter((user) => user.email !== email);
    io.emit("getOnlineUsers", onlineUsers);
    console.log(`User ${email} logged out`);
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
