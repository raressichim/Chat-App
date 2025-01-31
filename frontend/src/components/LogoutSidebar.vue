<template>
  <aside class="logout-sidebar">
    <IconLogout class="logout-icon" @click="logout"></IconLogout>
  </aside>
</template>

<script>
import { IconLogout } from "@tabler/icons-vue";
import socketService from "../services/socketService";
import axios from "@/plugins/axios";

export default {
  components: { IconLogout },
  methods: {
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

<style>
.logout-sidebar {
  width: 1%;
  background-color: #1e1e1e;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  align-items: center;
  padding: 20px;
  border-right: 1px solid rgba(0, 0, 0, 0.2);
  height: 100vh;
  position: relative;
}

.logout-icon {
  width: 24px;
  height: 24px;
  cursor: pointer;
  color: #ccc;
  transition: color 0.3s ease;
}

.logout-icon:hover {
  color: #c82333;
}
</style>
