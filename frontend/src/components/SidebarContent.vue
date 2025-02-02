<template>
  <div>
    <input
      v-model="localSearchQuery"
      type="text"
      placeholder="Search ..."
      class="user-search"
      @input="updateSearchQuery"
    />
    <button class="group-btn" @click="$emit('show-group-form')">+</button>
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
          <div class="request-content">
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
          <CIcon :icon="cilSend" class="send-icon" />
        </button>
      </li>
    </ul>
  </div>
</template>
<script>
import { CIcon } from "@coreui/icons-vue";
import { cilSend } from "@coreui/icons";

export default {
  components: {
    CIcon,
  },
  props: {
    filteredChats: Array,
    chatRequests: Array,
    filteredOtherUsers: Array,
    selectedUsername: String,
    searchQuery: String,
  },
  data() {
    return {
      localSearchQuery: this.searchQuery,
      cilSend,
    };
  },
  watch: {
    searchQuery(newValue) {
      this.localSearchQuery = newValue;
    },
  },
  methods: {
    selectChat(chat) {
      this.$emit("select-chat", chat);
    },
    respondToChatRequest(requestId, response) {
      this.$emit("respond-to-chat-request", requestId, response);
    },
    selectUser(username) {
      this.$emit("select-user", username);
    },
    updateSearchQuery() {
      this.$emit("update-search-query", this.localSearchQuery);
    },
    emitShowGroupForm() {
      this.$emit("show-group-form");
    },
  },
};
</script>

<style>
.chats-list,
.user-list {
  list-style: none;
  padding: 0;
  margin: 0;
  color: white;
}

.chats-item,
.user-item {
  padding: 10px;
  border-bottom: 1px solid #444;
  text-align: left;
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

.request-content {
  display: flex;
  flex-direction: column;
  align-items: center;
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
  margin-top: 5px;
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
.group-btn {
  color: white;
}

.send-icon {
  margin-left: 8px;
  width: 16px;
  height: 16px;
  color: #007bff;
  cursor: pointer;
  transition: color 0.3s ease;
}

.send-icon:hover {
  color: #0051a7;
}
</style>
