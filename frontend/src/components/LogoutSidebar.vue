<template>
  <aside class="logout-sidebar">
    <IconLogout class="logout-icon" @click="handleLogout"></IconLogout>
  </aside>
</template>

<script>
import { IconLogout } from "@tabler/icons-vue";

export default {
  components: { IconLogout },
  methods: {
    handleLogout() {
      this.$emit("logout");
    },
  },
};
</script>

<style>
.logout-sidebar {
  width: 40px;
  background-color: #1e1e1e;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  align-items: center;
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
@media (max-width: 768px) {
  .logout-sidebar {
    width: 0;
    padding: 0;
    overflow: hidden;
  }
}
</style>
