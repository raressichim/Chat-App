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
      <ul class="chats-list">
        <li
          v-for="chat in chats"
          :key="chat.id"
          :class="['chats-item', { 'selected-item': currentChat === chat.id }]"
          @click="selectChat(chat)"
        >
          <button>
            {{ chat.name }}
          </button>
        </li>
      </ul>
      <h3>Other Users</h3>
      <ul class="user-list">
        <li
          v-for="user in filteredOtherUsers"
          :key="user.id"
          :class="[
            'user-item',
            { 'selected-item': selectedUsername === user.username },
          ]"
        >
          <button @click="selectUser(user.username)">
            {{ user.username }}
          </button>
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
            <!-- Filter to show only individual users -->
            <li v-for="chat in nonGroupChats" :key="chat.name">
              <label>
                <input
                  type="checkbox"
                  v-model="selectedUsers"
                  :value="chat.name"
                />
                {{ chat.name }}
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
              'my-message': message.sender === username,
              'other-message': message.sender !== username,
            }"
            class="message"
          >
            <div class="message-wrap">
              <div class="message-wrap-content">
                <small v-if="message.sender !== username" class="sender-name">
                  {{ message.senderUsername || "" }}
                </small>
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
      otherUsers: [],
      selectedUsername: "",
      currentChat: "",
      messages: [],
      newMessage: "",
      searchQuery: "",
      showGroupForm: false,
      selectedUsers: [],
      groupName: "",
      chats: [],
    };
  },
  computed: {
    nonGroupChats() {
      return this.chats.filter((chat) => !chat.isGroup);
    },
    username() {
      console.log(this.$store.getters.getSharedData);
      return this.$store.getters.getSharedData;
    },
    filteredOtherUsers() {
      if (this.searchQuery.trim() === "") {
        const chatUsernames = this.chats
          .filter((chat) => !chat.isGroup)
          .map((chat) => chat.name);

        return this.otherUsers.filter(
          (user) =>
            !chatUsernames.includes(user.username) &&
            (user.username
              .toLowerCase()
              .includes(this.searchQuery.toLowerCase()) ||
              user.firstName
                .toLowerCase()
                .includes(this.searchQuery.toLowerCase()) ||
              user.lastName
                .toLowerCase()
                .includes(this.searchQuery.toLowerCase()))
        );
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
    this.fetchOtherUsers(this.username);
    this.fetchUserChats(this.username);
    socketService.connect(this.username);
    this.messages = [];

    socketService.socket.on("getMessage", (message) => {
      this.messages.push(message);
      nextTick(() => {
        const messagesContainer = this.$refs.messagesContainer;
        if (messagesContainer) {
          messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }
      });
    });
  },

  methods: {
    async fetchOtherUsers(username) {
      try {
        const response = await axios.get("/users/others", {
          params: { username: username },
        });
        this.otherUsers = response.data;
        console.log(this.otherUsers);
      } catch (err) {
        console.error("Error fetching other users:", err);
        this.otherUsers = [];
      }
    },
    async fetchUserChats(username) {
      try {
        const response = await axios.get(`/users/chats`, {
          params: { username: username },
        });
        const chats = response.data.chats;

        this.chats = chats.map((chat) => {
          const isGroup = chat.name && chat.name.trim() !== "";
          const otherUser = chat.users.find((user) => user !== this.username);

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
    async selectUser(username) {
      this.selectedUsername = username;
      try {
        const response = await axios.post("/chats", {
          users: [this.username, username],
          name: "name",
        });
        this.currentChat = response.data.chatId;
        console.log("Current chat id: " + this.currentChat);
        const messagesResponse = await axios.get("/chats/messages", {
          params: {
            chatId: this.currentChat,
          },
        });
        this.messages = messagesResponse.data.messages;
        console.log(
          "Conversation loaded between " +
            this.username +
            " and " +
            this.selectedUsername
        );

        nextTick(() => {
          const messagesContainer = this.$refs.messagesContainer;
          messagesContainer.scrollTop = messagesContainer.scrollHeight;
        });
      } catch (err) {
        console.error(err);
      }
    },
    async selectChat(chat) {
      try {
        this.selectedUsername = chat.isGroup ? null : chat.name;
        this.currentChat = chat.id;
        const messagesResponse = await axios.get("/chats/messages", {
          params: {
            chatId: this.currentChat,
          },
        });

        this.messages = messagesResponse.data.messages;
        console.log("Conversation loaded for chat:", chat.id);

        nextTick(() => {
          const messagesContainer = this.$refs.messagesContainer;
          messagesContainer.scrollTop = messagesContainer.scrollHeight;
        });
      } catch (err) {
        console.error(err);
      }
    },

    async sendMessage() {
      if (!this.currentChat) {
        console.warn("Please select a chat in orde to send a message");
        return;
      }

      const message = {
        sender: this.username,
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
          users: [this.username, ...this.selectedUsers],
          name: this.groupName,
        });
        this.currentChat = response.data.chatId;

        if (response.data.success) {
          alert("Group created successfully!");
          this.showGroupForm = false;
          this.groupName = "";
          this.selectedUsers = [];
          this.fetchOtherUsers(this.username);
        }
        //this.fetchOtherUsers();
      } catch (error) {
        console.error("Error creating group:", error);
      }
    },

    async logout() {
      try {
        await axios.post("/logout");
        socketService.socket.emit("logout", this.username);
        socketService.disconnect();
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

.chats-list,
.user-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.chats-item,
.user-item {
  padding: 10px;
  border-bottom: 1px solid #ddd;
  text-align: left;
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

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

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

.modal-content h3 {
  font-size: 22px;
  font-weight: bold;
  color: #333;
  margin-bottom: 15px;
}

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

.sender-name {
  font-size: 12px;
  font-weight: bold;
  color: #555;
  margin-bottom: 2px;
  display: block;
}

.my-message .sender-name {
  display: none;
}

.selected-item {
  background-color: #e2e3e5;
  border-radius: 4px;
  transition: background-color 0.3s ease;
}

.selected-item button {
  color: #343a40;
  font-weight: bold;
}
</style>
