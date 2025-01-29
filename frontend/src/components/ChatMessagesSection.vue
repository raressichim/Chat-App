<template>
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
