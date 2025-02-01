<template>
  <section class="chat-section">
    <div class="messages-container" ref="messagesContainer">
      <div v-if="!currentChat" class="no-chat-selected">
        <div class="welcome-message">
          <img
            :src="require('@/assets/intro-icon.png')"
            alt="Welcome!"
            class="welcome-icon"
          />
          <p>Select a chat and start typing..</p>
        </div>
      </div>
      <ul class="messages - list">
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
                {{ message.sender || "" }}
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
    <form v-if="currentChat" class="message-form" @submit.prevent="sendMessage">
      <input
        v-model="newMessage"
        type="text"
        placeholder="Type your message here..."
        class="message-input"
      />
      <button type="submit" class="send-button">Send</button>
    </form>
  </section>
</template>
<script>
export default {
  props: {
    messages: Array,
    currentChat: String,
    username: String,
  },
  data() {
    return {
      newMessage: "",
    };
  },
  watch: {
    messages: {
      handler() {
        this.$nextTick(() => {
          const container = this.$refs.messagesContainer;
          if (container) {
            container.scrollTop = container.scrollHeight;
          }
        });
      },
      deep: true,
      immediate: true,
    },
  },
  methods: {
    sendMessage() {
      if (this.newMessage.trim() && this.currentChat) {
        this.$emit("send-message", this.newMessage.trim());
        this.newMessage = "";
      }
    },
    formatTimestamp(timestamp) {
      const date = new Date(timestamp._seconds * 1000);
      return date.toLocaleTimeString();
    },
  },
};
</script>
<style>
.messages-container {
  flex-grow: 1;
  padding: 20px;
  overflow-y: auto;
  background: #1e1e1e;
  scroll-behavior: smooth;
}

.messages-container::-webkit-scrollbar {
  width: 8px;
}

.messages-container::-webkit-scrollbar-track {
  background: #1e1e1e;
}

.messages-container::-webkit-scrollbar-thumb {
  background: #444;
  border-radius: 4px;
}

.messages-container::-webkit-scrollbar-thumb:hover {
  background: #555;
}

.no-chat-selected {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 80%;
  color: white;
  font-size: 20px;
  text-align: center;
  flex-direction: column;
}

.welcome-message {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

.welcome-icon {
  width: 150px;
  height: 150px;
  margin-bottom: 40px;
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
  list-style: none;
}

.message.my-message {
  float: right;
  text-align: right;
  list-style: none;
}

.message-wrap {
  display: flex;
  margin-bottom: 10px;
  line-height: 1.4;
}

.message-wrap-content {
  animation: flyIn 0.6s ease-in-out;
  background-color: #007bff;
  border-radius: 8px 8px 8px 0;
  color: #fff;
  padding: 12px 20px;
  position: relative;
}

.message-wrap-content:before {
  border-bottom: 5px solid transparent;
  border-left: 5px solid #007bff;
  border-right: 5px solid transparent;
  border-top: 5px solid #007bff;
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
  background-color: #ffffff;
  border-radius: 8px 8px 0 8px;
  color: #343a40;
  order: 2;
  text-align: right;
}

.my-message .message-wrap-content:before {
  border-bottom: 5px solid transparent;
  border-left: 5px solid transparent;
  border-right: 5px solid #ffff;
  border-top: 5px solid #ffff;
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
  background: #1e1e1e;
  border-top: 1px solid #333;
}

.message-input {
  flex-grow: 1;
  padding: 10px;
  border: 2px solid #444;
  border-radius: 4px;
  background: #2c2c2c;
  color: white;
  margin-right: 10px;
}

.send-button {
  padding: 10px 20px;
  background: #007bff;
  border: none;
  border-radius: 4px;
  color: white;
  cursor: pointer;
  font-size: 16px;
}

.send-button:hover {
  background: #214f88;
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
</style>
