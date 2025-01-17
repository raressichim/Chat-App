<template>
  <div class="chat-room">
    <section class="other-users-container">
      <h3>Other Users</h3>
      <ul class="user-list">
        <li v-for="user in otherUsers" :key="user.id" class="user-item">
          <button @click="selectUser(user.email)">({{ user.email }})</button>
        </li>
      </ul>
    </section>
    <section class="messages-container" ref="messagesContainer">
      <ul class="messages-list">
        <li
          v-for="message in messages"
          :key="message.id"
          :class="{
            'my-message': message.sender === userEmail,
            'other-message': message.sender !== userEmail,
          }"
          class="message"
        >
          <div class="message-wrap">
            <div class="message-wrap-content">
              <p>{{ message.text }}</p>
              <small class="time">
                {{
                  message.createdAt && message.createdAt._seconds
                    ? new Date(
                        message.createdAt._seconds * 1000
                      ).toLocaleTimeString()
                    : "No Date Available"
                }}
              </small>
            </div>
          </div>
        </li>
      </ul>
    </section>
    <form class="message-form" @submit.prevent="sendMessage">
      <input
        v-model="newMessage"
        type="text"
        placeholder="Type your message here..."
        class="message-input"
      />
      <button type="submit" class="send-button">Send</button>
    </form>
  </div>
</template>

<script>
import socketService from "../services/socketService";
import axios from "@/plugins/axios";
import { nextTick } from "vue";

export default {
  name: "MessagesDashboard",
  data() {
    return {
      email: "",
      otherUsers: [],
      selectedUserEmail: "",
      currentChat: "",
      messages: [],
      newMessage: "",
    };
  },
  computed: {
    userEmail() {
      return this.$route.params.email;
    },
  },
  mounted() {
    this.fetchOtherUsers(this.userEmail);
    socketService.connect(this.userEmail);
    this.messages = [];

    socketService.socket.on("getMessage", (message) => {
      console.log("Message receiver: ", message);
      this.messages.push(message);
      nextTick(() => {
        const messagesContainer = this.$refs.messagesContainer;
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
      });
    });
  },
  methods: {
    async fetchOtherUsers(email) {
      try {
        const response = await axios.get("/users/others", {
          params: { email: email },
        });
        this.otherUsers = response.data;
      } catch (err) {
        console.error("Error fetching other users:", err);
        this.otherUsers = [];
      }
    },
    async selectUser(email) {
      this.selectedUserEmail = email;
      console.log(this.selectedUserEmail);
      try {
        const response = await axios.post("/chats", {
          sender: this.userEmail,
          recipient: email,
        });
        this.currentChat = response.data.chatId;
        console.log("Current chat id: " + this.currentChat);
        const messagesResponse = await axios.get("/chats/messages", {
          params: {
            firstEmail: this.userEmail,
            secondEmail: this.selectedUserEmail,
          },
        });
        this.messages = messagesResponse.data.messages;
        console.log(
          "Conversation loaded between " +
            this.userEmail +
            " and " +
            this.selectedUserEmail
        );

        nextTick(() => {
          const messagesContainer = this.$refs.messagesContainer;
          messagesContainer.scrollTop = messagesContainer.scrollHeight;
        });
      } catch (err) {
        console.error(err);
      }
    },

    async sendMessage() {
      if (!this.selectedUserEmail || !this.newMessage.trim()) {
        console.warn("Recipient or message is missing.");
        return;
      }

      const message = {
        sender: this.userEmail,
        recipient: this.selectedUserEmail,
        text: this.newMessage.trim(),
        chatId: this.currentChat,
        createdAt: {
          _seconds: Math.floor(new Date().getTime() / 1000), // Timestamp in seconds
          _nanoseconds: new Date().getMilliseconds() * 1000000, // Convert milliseconds to nanoseconds
        },
      };
      console.log(message);
      this.messages.push(message);
      nextTick(() => {
        const messagesContainer = this.$refs.messagesContainer;
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
      });
      this.newMessage = "";
      try {
        const response = await axios.post("/chats/messages", {
          message,
        });
        if (response !== null) {
          console.log("Message saved to backend:", response.data);
        }
      } catch (error) {
        console.error(
          "Error saving message:",
          error.response?.data || error.message
        );
      }

      try {
        await socketService.sendMessage(message);
      } catch (err) {
        console.error(err);
      }
    },
  },
};
</script>
<style scoped>
.chat-room {
  display: flex;
  flex-direction: column;
  height: calc(100vh - 51px);
  margin: auto;
  overflow: hidden;
}
.messages-container {
  flex-grow: 1;
  padding: 20px;
  overflow-y: auto;
}
.messages-list {
  list-style: none;
  margin: 0;
  padding: 0;
}
.message {
  margin-bottom: 24px;
  position: relative;
  clear: both;
}
.message.my-message {
  float: right;
  text-align: right;
}
.message-wrap {
  display: flex;
  margin-bottom: 10px;
  line-height: 1.4;
}
.message-wrap-content {
  animation: flyIn 0.6s ease-in-out;
  background-color: #7269ef;
  border-radius: 8px 8px 8px 0;
  color: #fff;
  padding: 12px 20px;
  position: relative;
}
.message-wrap-content:before {
  border-bottom: 5px solid transparent;
  border-left: 5px solid #7269ef;
  border-right: 5px solid transparent;
  border-top: 5px solid #7269ef;
  bottom: -10px;
  content: "";
  left: 0;
  position: absolute;
  right: auto;
}
.time {
  color: hsla(0, 0%, 100%, 0.5);
  font-size: 12px;
  margin-top: 4px;
  text-align: right;
}
.conversation-name {
  font-size: 14px;
  font-weight: 500;
}
.my-message .message-wrap-content {
  background-color: #f5f7fb;
  border-radius: 8px 8px 0 8px;
  color: #343a40;
  order: 2;
  text-align: right;
}
.my-message .message-wrap-content:before {
  border-bottom: 5px solid transparent;
  border-left: 5px solid transparent;
  border-right: 5px solid #f5f7fb;
  border-top: 5px solid #f5f7fb;
  left: auto;
  right: 0;
}
.my-message .time {
  color: #7a7f9a;
  text-align: left;
}

.message-form {
  display: flex;
  padding: 20px;
  background: #eceff1;
  border-top: 1px solid #ccc;
}
.message-input {
  flex-grow: 1;
  padding: 10px;
  border: 2px solid #ddd;
  border-radius: 4px;
  margin-right: 10px;
}
.send-button {
  padding: 10px 20px;
  background: #28a745;
  border: none;
  border-radius: 4px;
  color: white;
  cursor: pointer;
  font-size: 16px;
}
.send-button:hover {
  background: #218838;
}
.other-users-container {
  padding: 20px;
  background: #f5f7fb;
  border-bottom: 1px solid #ccc;
}
.user-list {
  list-style: none;
  padding: 0;
  margin: 0;
}
.user-item {
  padding: 10px;
  border-bottom: 1px solid #ddd;
}
.user-item:last-child {
  border-bottom: none;
}
.messages-container {
  flex-grow: 1;
  padding: 20px;
  overflow-y: auto;
  scroll-behavior: smooth;
}
</style>
