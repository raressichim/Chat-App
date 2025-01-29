<template>
  <div class="chat-room">
    <LogoutSidebar @logout="logout" />
    <ChatSidebar
      v-model:searchQuery="searchQuery"
      :chats="chats"
      :currentChat="currentChat"
      :chatRequests="chatRequests"
      :otherUsers="otherUsers"
      :selectedUsername="selectedUsername"
      @show-group-form="showGroupForm = true"
      @select-chat="selectChat"
      @respond-request="respondToChatRequest"
      @select-user="selectUser"
    />
    <CreateGroupForm
      v-if="showGroupForm"
      :visible="showGroupForm"
      :users="nonGroupChats.map((chat) => chat.name)"
      @create-group="handleCreateGroup"
      @close="showGroupForm = false"
    />
    <ChatMessagesSection
      :messages="messages"
      :currentChat="currentChat"
      :username="username"
      @send-message="sendMessage"
    />
  </div>
</template>

<script>
import socketService from "../services/socketService";
import axios from "@/plugins/axios";
import { nextTick } from "vue";
import LogoutSidebar from "./LogoutSidebar.vue";
import ChatSidebar from "./ChatSidebar.vue";
import CreateGroupForm from "./CreateGroupForm.vue";
import ChatMessagesSection from "./ChatMessagesSection.vue";

export default {
  name: "MessagesDashboard",
  components: {
    LogoutSidebar,
    ChatSidebar,
    CreateGroupForm,
    ChatMessagesSection,
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
      chatRequests: [],
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
  },
  mounted() {
    this.fetchOtherUsers();
    this.fetchUserChats();
    this.fetchChatRequests();
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
    async fetchOtherUsers() {
      try {
        const response = await axios.get("/users/others", {
          params: { username: this.username },
        });
        this.otherUsers = response.data;
        console.log(this.otherUsers);
      } catch (err) {
        console.error("Error fetching other users:", err);
        this.otherUsers = [];
      }
    },
    async fetchUserChats() {
      try {
        const response = await axios.get(`/users/chats`, {
          params: { username: this.username },
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
    async fetchChatRequests() {
      try {
        const response = await axios.get("/chats/requests", {
          params: { username: this.username },
        });
        this.chatRequests = response.data;
      } catch (err) {
        console.error("Error fetching chat requests:", err);
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
          if (messagesContainer) {
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
          }
        });
      } catch (err) {
        console.error(err);
      }
    },
    async selectUser(username) {
      this.selectedUsername = username;
      try {
        const responseRequest = await axios.post("/chats/requests", {
          sender: this.username,
          receiver: username,
        });
        console.log("Request response: " + responseRequest);
        alert("Chat request sent!");
        nextTick(() => {
          const messagesContainer = this.$refs.messagesContainer;
          if (messagesContainer) {
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
          }
        });
      } catch (err) {
        console.error(err);
      }
    },
    async respondToChatRequest(requestId, status) {
      try {
        await axios.patch(
          "/chats/requests",
          { status },
          { params: { requestId } }
        );
        alert(`Chat request ${status}!`);

        this.fetchChatRequests();
        if (status === "accepted") this.fetchUserChats(this.username);
      } catch (err) {
        console.error(`Error updating chat request to ${status}:`, err);
        alert("Failed to update chat request.");
      }
    },
    async sendMessage(messageText) {
      if (!this.currentChat) {
        console.warn("Please select a chat in orde to send a message");
        return;
      }

      const message = {
        sender: this.username,
        text: messageText.trim(),
        chatId: this.currentChat,
        createdAt: {
          _seconds: Math.floor(new Date().getTime() / 1000), // Timestamp in seconds
          _nanoseconds: new Date().getMilliseconds() * 1000000, // Convert milliseconds to nanoseconds
        },
      };

      this.newMessage = "";
      try {
        const response = await axios.post("/chats/messages", {
          message,
        });
        if (response !== null) {
          console.log("Message saved to backend:", response.data);
        }
        await socketService.sendMessage(message);
        nextTick(() => {
          const messagesContainer = this.$refs.messagesContainer;
          if (messagesContainer) {
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
          }
        });
      } catch (error) {
        console.error(
          "Error saving message:",
          error.response?.data || error.message
        );
      }
    },
    async handleCreateGroup({ groupName, users }) {
      try {
        const response = await axios.post("/chats", {
          users: [this.username, ...users],
          name: groupName,
        });
        this.currentChat = response.data.chatId;

        if (response.data.success) {
          alert("Group created successfully!");
          this.showGroupForm = false;
          this.groupName = "";
          this.selectedUsers = [];
          this.fetchUserChats();
        }
      } catch (error) {
        console.error("Error creating group:", error);
        alert("Failed to create group.");
      }
    },
  },
};
</script>
<style scoped>
.chat-room {
  display: flex;
  flex-direction: row;
  height: 100vh;
  overflow: hidden;
}
</style>
