<template>
  <div class="sidebar-controls">
    <button class="toggle-sidebar" @click="toggleSidebar">☰</button>

    <button v-if="isSidebarVisible" class="logout-button" @click="handleLogout">
      <IconLogout class="logout-icon" />
    </button>
  </div>

  <!-- Mobile Sidebar -->
  <aside
    v-if="isMobile"
    :class="{
      'sidebar-open': isSidebarVisible,
      'sidebar-closed': !isSidebarVisible,
    }"
  >
    <SidebarContent
      :filteredChats="filteredChats"
      :chatRequests="chatRequests"
      :filteredOtherUsers="filteredOtherUsers"
      :selectedUsername="selectedUsername"
      @select-chat="selectChat"
      @respond-to-chat-request="respondToChatRequest"
      @select-user="selectUser"
      @update-search-query="updateSearchQuery"
      @show-group-form="$emit('show-group-form')"
      :searchQuery="localSearchQuery"
    />
  </aside>

  <!-- Desktop Sidebar -->
  <aside class="conversation-container">
    <SidebarContent
      :filteredChats="filteredChats"
      :chatRequests="chatRequests"
      :filteredOtherUsers="filteredOtherUsers"
      :selectedUsername="selectedUsername"
      @select-chat="selectChat"
      @respond-to-chat-request="respondToChatRequest"
      @select-user="selectUser"
      @update-search-query="updateSearchQuery"
      @show-group-form="$emit('show-group-form')"
      :searchQuery="localSearchQuery"
    />
  </aside>
</template>

<script>
import SidebarContent from "./SidebarContent.vue";
import { IconLogout } from "@tabler/icons-vue";
export default {
  components: {
    SidebarContent,
    IconLogout,
  },
  props: {
    searchQuery: String,
    chats: Array,
    currentChat: Number,
    chatRequests: Array,
    otherUsers: Array,
    selectedUsername: String,
  },
  data() {
    return {
      localSearchQuery: this.searchQuery,
      isSidebarVisible: false,
      isMobile: window.innerWidth < 768,
    };
  },
  watch: {
    searchQuery(newValue) {
      this.localSearchQuery = newValue;
    },
  },
  computed: {
    filteredChats() {
      if (this.localSearchQuery.trim() === "") {
        return this.chats;
      }

      return this.chats.filter((chat) => {
        const chatNameMatch = chat.name
          .toLowerCase()
          .includes(this.localSearchQuery.toLowerCase());

        let usersMatch = false;
        if (chat.isGroup && Array.isArray(chat.users)) {
          usersMatch = chat.users.some((user) =>
            user.toLowerCase().includes(this.localSearchQuery.toLowerCase())
          );
        }

        return chatNameMatch || usersMatch;
      });
    },
    filteredOtherUsers() {
      const searchQuery = this.localSearchQuery.trim().toLowerCase();

      const chatUsernames = new Set(
        this.chats.filter((chat) => !chat.isGroup).map((chat) => chat.name)
      );

      return this.otherUsers.filter((user) => {
        const matchesSearch =
          user.username.toLowerCase().includes(searchQuery) ||
          user.firstName.toLowerCase().includes(searchQuery) ||
          user.lastName.toLowerCase().includes(searchQuery);

        return !chatUsernames.has(user.username) && matchesSearch;
      });
    },
  },
  methods: {
    updateSearchQuery(newQuery) {
      this.localSearchQuery = newQuery;
      this.$emit("update:searchQuery", newQuery);
    },
    selectChat(chat) {
      this.$emit("select-chat", chat);
      this.isSidebarVisible = false;
    },
    respondToChatRequest(requestId, status) {
      this.$emit("respond-request", requestId, status);
    },
    selectUser(username) {
      this.$emit("select-user", username);
    },
    toggleSidebar() {
      this.isSidebarVisible = !this.isSidebarVisible;
    },
    checkMobile() {
      this.isMobile = window.innerWidth < 768;
      if (!this.isMobile) {
        this.isSidebarVisible = false;
      }
    },
    handleLogout() {
      this.$emit("logout");
    },
  },
  mounted() {
    window.addEventListener("resize", this.checkMobile);
  },
  beforeUnmount() {
    window.removeEventListener("resize", this.checkMobile);
  },
};
</script>

<style>
.conversation-container {
  width: 25%;
  padding: 20px;
  background: #282c34;
  border-right: 1px solid #333;
  overflow-y: auto;
  color: #fff;
}

.logout-button {
  margin-left: 265px;
  margin-top: 17px;
}

.conversation-container::-webkit-scrollbar {
  width: 8px;
}

.conversation-container::-webkit-scrollbar-track {
  background: #1e1e1e;
}

.conversation-container::-webkit-scrollbar-thumb {
  background: #444;
  border-radius: 4px;
}

.conversation-container::-webkit-scrollbar-thumb:hover {
  background: #555;
}

.sidebar-controls {
  display: flex;
  align-items: center;
  position: absolute;
  top: 10px;
  left: 10px;
  z-index: 100;
}

.toggle-sidebar {
  display: none;
  background: transparent;
  border: none;
  font-size: 24px;
  color: white;
  cursor: pointer;
}

@media (max-width: 768px) {
  .toggle-sidebar {
    display: block;
    position: absolute;
    top: 10px;
    left: 10px;
    z-index: 100;
  }

  aside {
    position: absolute;
    top: 0;
    left: -100%;
    width: 80%;
    height: 100vh;
    background: #222;
    transition: left 0.3s ease-in-out;
    z-index: 50;
    overflow-y: auto;
  }

  .sidebar-open {
    left: 0;
  }

  .sidebar-closed {
    left: -100%;
  }

  .user-search {
    margin-top: 60px;
  }
}
</style>
