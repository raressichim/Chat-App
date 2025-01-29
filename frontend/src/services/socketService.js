import { io } from "socket.io-client";

const socketService = {
  socket: null,
  onlineUsers: [],

  connect(username) {
    if (this.socket) {
      console.warn("Socket already connected.");
      return;
    }

    this.socket = io("http://localhost:3000");

    this.socket.emit("addNewUser", username);

    this.socket.on("getOnlineUsers", (res) => {
      this.onlineUsers = res;
      console.log("Online users: " + this.onlineUsers);
    });
  },

  async sendMessage(message) {
    if (this.socket === null) {
      console.warn("Socket not connected");
      return;
    }

    this.socket.emit("sendMessage", {
      message,
    });
  },

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  },
};

export default socketService;
