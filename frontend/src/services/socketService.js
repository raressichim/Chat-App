import { io } from "socket.io-client";
// import axios from "@/plugins/axios";

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

  // async fetchMessages(firstUsername, secondUsername) {
  //   try {
  //     const chatId = await axios.post("/chats", {
  //       firstUser: firstUsername,
  //       secondUser: secondUsername,
  //     });
  //     const response = await axios.get(`/chats/${chatId}/messages`);

  //     return response.data;
  //   } catch (error) {
  //     console.error(
  //       "Error fetching messages:",
  //       error.response?.data || error.message
  //     );
  //     return [];
  //   }
  // },

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
