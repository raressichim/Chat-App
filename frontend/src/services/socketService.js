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

  async fetchMessages(firstId, secondId) {
    try {
      const chatId = await axios.post("/chats", {
        firstId: firstId,
        secondId: secondId,
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

  async sendMessage(senderEmail, messageData, recipientEmail) {
    if (this.socket === null) {
      console.warn("Socket not connected");
      return;
    }

    this.socket.emit("sendMessage", {
      senderEmail,
      messageData,
      recipientEmail,
    });

    try {
      const chatId = await axios.post("/chats", {
        firstId: senderEmail,
        secondId: recipientEmail,
      });
      const response = await axios.post(`/chats/${chatId}/messages`, {
        senderEmail,
        recipientEmail,
        messageData,
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
