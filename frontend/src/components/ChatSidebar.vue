<template>
  <aside class="conversation-container">
    <input
      v-model="localSearchQuery"
      type="text"
      placeholder="Search ..."
      class="user-search"
      @input="updateSearchQuery"
    />
    <button class="create-group-btn" @click="$emit('show-group-form')">
      +
    </button>
    <h3>Chats</h3>
    <ul class="chats-list">
      <li
        v-for="chat in filteredChats"
        :key="chat.id"
        :class="['chats-item', { 'selected-item': currentChat === chat.id }]"
        @click="selectChat(chat)"
      >
        <button>
          {{ chat.name }}
        </button>
      </li>
    </ul>
    <div class="chat-requests-container" v-if="chatRequests.length > 0">
      <h3>Chat Requests</h3>
      <ul class="chat-requests-list">
        <li
          v-for="request in chatRequests"
          :key="request.id"
          class="chat-request-item"
        >
          <span class="chat-request-text">
            @{{ request.sender }} sent you a chat request.
          </span>
          <div class="chat-request-buttons">
            <button
              class="chat-request-accept"
              @click="respondToChatRequest(request.id, 'accepted')"
            >
              Accept
            </button>
            <button
              class="chat-request-reject"
              @click="respondToChatRequest(request.id, 'rejected')"
            >
              Reject
            </button>
          </div>
        </li>
      </ul>
    </div>
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
</template>

<script>
export default {
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

        return searchQuery
          ? matchesSearch
          : !chatUsernames.has(user.username) && matchesSearch;
      });
    },
  },
  methods: {
    updateSearchQuery() {
      this.$emit("update:searchQuery", this.localSearchQuery);
    },
    selectChat(chat) {
      this.$emit("select-chat", chat);
    },
    respondToChatRequest(requestId, status) {
      this.$emit("respond-request", requestId, status);
    },
    selectUser(username) {
      this.$emit("select-user", username);
    },
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

.chats-list,
.user-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.chats-item,
.user-item {
  padding: 10px;
  border-bottom: 1px solid #444;
  text-align: left;
}

.chat-section {
  width: 75%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.selected-item {
  background-color: #343a40;
  border-radius: 4px;
  transition: background-color 0.3s ease;
}

.selected-item button {
  color: #fff;
}

h3 {
  font-size: 1.5rem;
  color: #fff;
  margin-bottom: 15px;
  margin-top: 15px;
}

.chat-requests-container {
  font-family: Arial, sans-serif;
  background-color: #2a2a2a;
  padding: 16px;
  border-radius: 12px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
  margin: 20px 0;
}

.chat-requests-container h3 {
  font-size: 1.25rem;
  color: #fff;
  margin-bottom: 16px;
  font-weight: 600;
}

.chat-requests-list {
  list-style-type: none;
  padding: 0;
  margin: 0;
}

.chat-request-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #343a40;
  padding: 12px 16px;
  margin-bottom: 12px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.chat-request-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
}

.chat-request-text {
  font-size: 0.95rem;
  color: #e1e1e1;
  flex-grow: 1;
}

.chat-request-buttons {
  display: flex;
  gap: 8px;
}

.chat-request-accept,
.chat-request-reject {
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: background-color 0.3s ease, transform 0.2s ease;
}

.chat-request-accept {
  background-color: #4caf50;
  color: white;
}

.chat-request-accept:hover {
  background-color: #45a049;
  transform: scale(1.05);
}

.chat-request-reject {
  background-color: #f44336;
  color: white;
}

.chat-request-reject:hover {
  background-color: #e53935;
  transform: scale(1.05);
}

.user-search {
  width: 100%;
  padding: 10px;
  margin-bottom: 10px;
  border: 2px solid #444;
  border-radius: 4px;
  font-size: 14px;
  color: #fff;
  background-color: #2c2c2c;
}
</style>
