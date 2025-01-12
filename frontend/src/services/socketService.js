import { io } from "socket.io-client";
import axios from "@/plugins/axios";

const socketService = {
  socket: null,
  onlineUsers: [],

  connect(userEmail) {
    if (this.socket) {
      console.warn("Socket already connected.");
      return;
    }

    this.socket = io("http://localhost:3000");

    this.socket.emit("addNewUser", userEmail);

    this.socket.on("getOnlineUsers", (res) => {
      this.onlineUsers = res;
      console.log(this.onlineUsers);
    });
  },

  async fetchMessages(firstEmail, secondEmail) {
    try {
      const chatId = await axios.post("/chats", {
        firstEmail: firstEmail,
        secondEmail: secondEmail,
      });
      const response = await axios.get(`/chats/${chatId}/messages`);

      return response.data;
    } catch (error) {
      console.error(
        "Error fetching messages:",
        error.response?.data || error.message
      );
      return [];
    }
  },

  async sendMessage(message) {
    if (this.socket === null) {
      console.warn("Socket not connected");
      return;
    }

    this.socket.emit("sendMessage", {
      message,
    });

    try {
      const chatId = message.chatId;
      const response = await axios.post(`/chats/${chatId}/messages`, {
        message,
      });
      console.log("Message saved to backend:", response.data);
    } catch (error) {
      console.error(
        "Error saving message:",
        error.response?.data || error.message
      );
    }
  },

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  },
};

export default socketService;
