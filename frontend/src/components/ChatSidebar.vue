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
    <div class="chat-requests-container">
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
    filteredOtherUsers() {
      if (this.localSearchQuery.trim() === "") {
        const chatUsernames = this.chats
          .filter((chat) => !chat.isGroup)
          .map((chat) => chat.name);

        return this.otherUsers.filter(
          (user) =>
            !chatUsernames.includes(user.username) &&
            (user.username
              .toLowerCase()
              .includes(this.localSearchQuery.toLowerCase()) ||
              user.firstName
                .toLowerCase()
                .includes(this.localSearchQuery.toLowerCase()) ||
              user.lastName
                .toLowerCase()
                .includes(this.localSearchQuery.toLowerCase()))
        );
      } else {
        return this.otherUsers.filter(
          (user) =>
            user.username
              .toLowerCase()
              .includes(this.localSearchQuery.toLowerCase()) ||
            user.firstName
              .toLowerCase()
              .includes(this.localSearchQuery.toLowerCase()) ||
            user.lastName
              .toLowerCase()
              .includes(this.localSearchQuery.toLowerCase())
        );
      }
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

.selected-item {
  background-color: #e2e3e5;
  border-radius: 4px;
  transition: background-color 0.3s ease;
}

.selected-item button {
  color: #343a40;
  font-weight: bold;
}

.chat-requests-container {
  font-family: Arial, sans-serif;
  background-color: #f9f9f9;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  max-width: 500px;
  margin: auto;
}

h3 {
  font-size: 1.5rem;
  color: #333;
  margin-bottom: 15px;
}

.chat-requests-list {
  list-style-type: none;
  padding: 0;
}

.chat-request-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #fff;
  padding: 10px 15px;
  margin-bottom: 10px;
  border-radius: 6px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.chat-request-text {
  font-size: 1rem;
  color: #555;
}

.chat-request-buttons {
  display: flex;
  gap: 10px;
}

.chat-request-accept,
.chat-request-reject {
  border: none;
  padding: 8px 12px;
  border-radius: 5px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: background-color 0.3s ease, color 0.3s ease;
}

.chat-request-accept {
  background-color: #4caf50;
  color: white;
}

.chat-request-accept:hover {
  background-color: #45a049;
}

.chat-request-reject {
  background-color: #f44336;
  color: white;
}

.chat-request-reject:hover {
  background-color: #e53935;
}

.user-search {
  width: 100%;
  padding: 10px;
  margin-bottom: 10px;
  border: 2px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}
</style>
