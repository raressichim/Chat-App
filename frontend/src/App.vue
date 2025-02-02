<template>
  <v-container fluid class="custom-container">
    <router-view />
  </v-container>
</template>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}

.custom-container {
  background-color: transparent !important;
  padding: 0 !important;
  margin: 0 !important;
}
</style>
