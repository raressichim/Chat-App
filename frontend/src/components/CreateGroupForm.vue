<template>
  <transition name="fade">
    <div v-if="visible" class="modal-overlay">
      <div class="modal-content">
        <h3>Create Group</h3>
        <input v-model="groupName" type="text" placeholder="Enter Group Name" />

        <h4 class="select-text">Select Users:</h4>
        <ul>
          <li v-for="user in users" :key="user">
            <label>
              <input type="checkbox" v-model="selectedUsers" :value="user" />
              {{ user }}
            </label>
          </li>
        </ul>

        <div class="button-container">
          <button @click="createGroup">Create</button>
          <button @click="closeForm">Cancel</button>
        </div>
      </div>
    </div>
  </transition>
</template>

<script>
import { useToast } from "vue-toastification";

export default {
  props: {
    users: {
      type: Array,
      required: true,
    },
    visible: {
      type: Boolean,
      required: true,
    },
  },
  data() {
    return {
      groupName: "",
      selectedUsers: [],
    };
  },
  methods: {
    createGroup() {
      if (!this.groupName.trim() || this.selectedUsers.length < 2) {
        useToast().warning(
          "Enter a valid group name and select at least two users."
        );
        return;
      }
      this.$emit("create-group", {
        groupName: this.groupName.trim(),
        users: this.selectedUsers,
      });
      this.$emit("close");
    },
    closeForm() {
      this.$emit("close");
    },
  },
};
</script>

<style>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: #282c34;
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
  color: #fff;
  margin-bottom: 15px;
}

.modal-content input[type="text"] {
  width: 100%;
  padding: 10px;
  margin-bottom: 15px;
  border: 2px solid #555;
  border-radius: 5px;
  font-size: 14px;
  outline: none;
  color: #fff;
  background-color: #333;
}

.select-text {
  color: white;
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
  color: #fff;
}

.modal-content label {
  display: flex;
  align-items: center;
  gap: 5px;
  color: #fff;
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
</style>
