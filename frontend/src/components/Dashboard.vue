<template>
  <div class="chat-room">
    <!-- Logout Sidebar -->
    <aside class="logout-sidebar">
      <IconLogout class="logout-icon" @click="logout"></IconLogout>
    </aside>
    <!-- Sidebar with user list -->
    <aside class="other-users-container">
      <input
        v-model="searchQuery"
        type="text"
        placeholder="Search ..."
        class="user-search"
        @input="filterUsers"
      />
      <button class="create-group-btn" @click="showGroupForm = true">+</button>
      <h3>Chats</h3>
      <ul class="user-list">
        <li v-for="user in filteredOtherUsers" :key="user.id" class="user-item">
          <button @click="selectUser(user.email)">{{ user.username }}</button>
        </li>
      </ul>
    </aside>
    <transition name="fade">
      <div v-if="showGroupForm" class="modal-overlay">
        <div class="modal-content">
          <h3>Create Group</h3>
          <input
            v-model="groupName"
            type="text"
            placeholder="Enter Group Name"
          />

          <h4>Select Users:</h4>
          <ul>
            <li v-for="user in otherUsers" :key="user.id">
              <label>
                <input
                  type="checkbox"
                  v-model="selectedUsers"
                  :value="user.email"
                />
                {{ user.username }}
              </label>
            </li>
          </ul>

          <div class="button-container">
            <button @click="createGroup">Create</button>
            <button @click="showGroupForm = false">Cancel</button>
          </div>
        </div>
      </div>
    </transition>

    <!-- Chat messages section -->
    <section class="chat-section">
      <div class="messages-container" ref="messagesContainer">
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
      </div>
      <form class="message-form" @submit.prevent="sendMessage">
        <input
          v-model="newMessage"
          type="text"
          placeholder="Type your message here..."
          class="message-input"
        />
        <button type="submit" class="send-button">Send</button>
      </form>
    </section>
  </div>
</template>

<script>
import socketService from "../services/socketService";
import axios from "@/plugins/axios";
import { nextTick } from "vue";
import { IconLogout } from "@tabler/icons-vue";

export default {
  name: "MessagesDashboard",
  components: {
    IconLogout,
  },
  data() {
    return {
      email: "",
      otherUsers: [],
      selectedUserEmail: "",
      currentChat: "",
      messages: [],
      newMessage: "",
      searchQuery: "",
      showGroupForm: false,
      selectedUsers: [],
      groupName: "",
    };
  },
  computed: {
    userEmail() {
      console.log(this.$store.getters.getSharedData);
      return this.$store.getters.getSharedData;
    },
    filteredOtherUsers() {
      if (this.searchQuery.trim() === "") {
        return this.otherUsers;
      } else {
        return this.otherUsers.filter(
          (user) =>
            user.username
              .toLowerCase()
              .includes(this.searchQuery.toLowerCase()) ||
            user.firstName
              .toLowerCase()
              .includes(this.searchQuery.toLowerCase()) ||
            user.lastName.toLowerCase().includes(this.searchQuery.toLowerCase())
        );
      }
    },
  },
  mounted() {
    //this.fetchOtherUsers(this.userEmail);
    this.fetchUserChats(this.userEmail);
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
        console.log(this.otherUsers);
      } catch (err) {
        console.error("Error fetching other users:", err);
        this.otherUsers = [];
      }
    },
    async fetchUserChats(email) {
      try {
        const response = await axios.get(`/users/chats`, {
          params: { email: email },
        });
        const chats = response.data.chats;

        this.chats = chats.map((chat) => {
          const isGroup = chat.name && chat.name.trim() !== "";
          const otherUser = chat.users.find((user) => user !== this.userEmail);

          return {
            id: chat.id,
            name: isGroup ? chat.name : otherUser,
            isGroup,
          };
        });

        console.log("Chats fetched:", this.chats);
      } catch (err) {
        console.error("Error fetching chats:", err);
      }
    },
    async selectUser(email) {
      this.selectedUserEmail = email;
      console.log(this.selectedUserEmail);
      try {
        const response = await axios.post("/chats", {
          users: [this.userEmail, email],
          name: "name",
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
    async createGroup() {
      if (!this.groupName.trim() || this.selectedUsers.length < 2) {
        alert("Enter a valid group name and select at least two users.");
        return;
      }

      try {
        const response = await axios.post("/chats", {
          users: [this.userEmail, ...this.selectedUsers],
          name: this.groupName,
        });
        this.currentChat = response.data.chatId;

        if (response.data.success) {
          alert("Group created successfully!");
          this.showGroupForm = false;
          this.groupName = "";
          this.selectedUsers = [];
          this.fetchOtherUsers(this.userEmail);
        }
        this.fetchOtherUsers();
      } catch (error) {
        console.error("Error creating group:", error);
      }
    },

    async logout() {
      try {
        await axios.post("/logout");
        socketService.socket.emit("logout", this.userEmail);
        this.$store.dispatch("updateSharedData", "");
        this.$router.push("/");
      } catch (error) {
        console.error(
          "Error during logout:",
          error.response?.data || error.message
        );
      }
    },
  },
};
</script>
<style scoped>
.logout-sidebar {
  width: 1%;
  background-color: #f8f9fa;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  align-items: center;
  padding: 20px;
  border-right: 1px solid #ddd;
  height: 100vh;
  position: relative;
}

.logout-icon {
  width: 24px;
  height: 24px;
  cursor: pointer;
  color: black;
  transition: color 0.3s ease;
}

.logout-icon:hover {
  color: #c82333;
}
.chat-room {
  display: flex;
  flex-direction: row;
  height: 100vh;
  overflow: hidden;
}

.other-users-container {
  width: 25%;
  padding: 20px;
  background: #f5f7fb;
  border-right: 1px solid #ccc;
  overflow-y: auto;
}

.user-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.user-item {
  padding: 10px;
  border-bottom: 1px solid #ddd;
  text-align: left;
}

.user-item:last-child {
  border-bottom: none;
}

.chat-section {
  width: 75%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.messages-container {
  flex-grow: 1;
  padding: 20px;
  overflow-y: auto;
  background: #ffffff;
  scroll-behavior: smooth;
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

.user-search {
  width: 100%;
  padding: 10px;
  margin-bottom: 10px;
  border: 2px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

/* Modal Overlay (Shaded Background) */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.5); /* Semi-transparent dark background */
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000; /* Make sure it appears on top */
}

/* Modal Content */
.modal-content {
  background: white;
  padding: 20px;
  border-radius: 10px;
  width: 350px;
  text-align: center;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
}

/* Title */
.modal-content h3 {
  font-size: 22px;
  font-weight: bold;
  color: #333;
  margin-bottom: 15px;
}

/* Input Field */
.modal-content input[type="text"] {
  width: 100%;
  padding: 10px;
  margin-bottom: 15px;
  border: 2px solid #ccc;
  border-radius: 5px;
  font-size: 14px;
  outline: none;
}

.modal-content input[type="text"]:focus {
  border-color: #007bff;
}

/* User List */
.modal-content ul {
  list-style: none;
  padding: 0;
  width: 100%;
}

.modal-content ul li {
  text-align: left;
  padding: 5px;
}

.modal-content label {
  display: flex;
  align-items: center;
  gap: 5px;
}

/* Buttons */
.button-container {
  display: flex;
  justify-content: space-between;
  width: 100%;
  padding-top: 15px;
}

.button-container button {
  width: 45%;
  padding: 12px;
  border: none;
  border-radius: 5px;
  font-size: 14px;
  cursor: pointer;
  font-weight: bold;
}

.button-container button:first-of-type {
  background: #007bff;
  color: white;
}

.button-container button:first-of-type:hover {
  background: #0056b3;
}

.button-container button:last-of-type {
  background: #dc3545;
  color: white;
}

.button-container button:last-of-type:hover {
  background: #c82333;
}
</style>
