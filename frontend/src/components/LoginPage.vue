<template>
  <v-app dark>
    <v-main class="dark-theme">
      <v-container fluid fill-height>
        <v-row align="center" justify="center" class="fill-height">
          <v-col cols="12" sm="8" md="6" lg="4">
            <v-card class="elevation-12 dark-card">
              <v-toolbar dark color="blue darken-3">
                <v-toolbar-title v-if="!sessionExists">
                  {{
                    isRegister ? stateObj.register.name : stateObj.login.name
                  }}
                  form
                </v-toolbar-title>
                <v-toolbar-title v-else>
                  You are already logged in on another tab
                </v-toolbar-title>
              </v-toolbar>

              <v-card-text v-if="!sessionExists">
                <form
                  ref="form"
                  @submit.prevent="isRegister ? register() : login()"
                >
                  <v-text-field
                    v-if="isRegister"
                    v-model="firstName"
                    name="firstName"
                    label="First Name"
                    type="text"
                    placeholder="First Name"
                    class="dark-input"
                    required
                  ></v-text-field>

                  <v-text-field
                    v-if="isRegister"
                    v-model="lastName"
                    name="LastName"
                    label="Last Name"
                    type="text"
                    placeholder="Last Name"
                    class="dark-input"
                    required
                  ></v-text-field>

                  <v-text-field
                    v-if="isRegister"
                    v-model="username"
                    name="Username"
                    label="Username"
                    type="text"
                    placeholder="username"
                    class="dark-input"
                    required
                  ></v-text-field>

                  <v-text-field
                    v-model="email"
                    name="email"
                    label="Email"
                    type="text"
                    placeholder="email"
                    class="dark-input"
                    required
                  ></v-text-field>

                  <v-text-field
                    v-model="password"
                    name="password"
                    label="Password"
                    type="password"
                    placeholder="password"
                    class="dark-input"
                    required
                  ></v-text-field>

                  <v-text-field
                    v-if="isRegister"
                    v-model="confirmPassword"
                    name="confirmPassword"
                    label="Confirm Password"
                    type="password"
                    placeholder="confirm password"
                    class="dark-input"
                    required
                  ></v-text-field>

                  <div class="red--text">{{ errorMessage }}</div>
                  <v-btn
                    type="submit"
                    class="mt-4 dark-button"
                    color="blue darken-2"
                    value="log in"
                  >
                    {{
                      isRegister ? stateObj.register.name : stateObj.login.name
                    }}
                  </v-btn>
                  <div
                    class="toggle-link mt-4"
                    v-on:click="isRegister = !isRegister"
                  >
                    {{ toggleMessage }}
                  </div>
                </form>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </v-main>
  </v-app>
</template>

<script>
import axios from "@/plugins/axios";

async function createUser(userData) {
  try {
    const response = await axios.post("/users", userData);
    return response.data;
  } catch (error) {
    console.error(error.response?.data?.message || "Registration failed");
    throw new Error(error.response?.data?.message || "Login failed");
  }
}

async function loginUser(email, password) {
  try {
    const response = await axios.post("/login", { email, password });
    return response.data;
  } catch (error) {
    console.error(error.response?.data?.message || "Login failed");
    throw new Error(error.response?.data?.message || "Login failed");
  }
}

export default {
  name: "App",
  data() {
    return {
      email: "",
      password: "",
      username: "",
      confirmPassword: "",
      firstName: "",
      lastName: "",
      isRegister: false,
      errorMessage: "",
      sessionExists: false,
      stateObj: {
        register: {
          name: "Register",
          message: "Already have an account? Login.",
        },
        login: {
          name: "Login",
          message: "Register",
        },
      },
    };
  },
  methods: {
    async checkSession() {
      try {
        const response = await axios.get("/session");
        if (response.status != 200) {
          this.sessionExists = true;
          this.errorMessage = "You are already logged in in another tab.";
          console.error(response.data.message);
        } else {
          this.sessionExists = false;
        }
      } catch (error) {
        if (error.response && error.response.status === 401) {
          this.sessionExists = true;
          console.error("User already logged in");
        } else {
          console.error("Error checking session:", error);
        }
      }
    },

    async login() {
      try {
        const response = await loginUser(this.email, this.password);
        if (response) {
          this.errorMessage = "";
          this.username = response.username;
          console.log("The user " + this.username + " just logged in");
          this.$store.dispatch("updateSharedData", this.username);
          this.$router.replace({
            name: "dashboard",
            params: { username: this.username },
          });
        }
      } catch (err) {
        this.errorMessage = err.message;
        console.error("Error during logging in:", err);
      }
    },
    async register() {
      if (this.password === this.confirmPassword) {
        const userData = {
          firstName: this.firstName,
          lastName: this.lastName,
          username: this.username,
          email: this.email,
          password: this.password,
        };

        try {
          await createUser(userData);
          console.log("User created " + userData.username);
          this.isRegister = false;
          this.errorMessage = "";
          this.$refs.form.reset();
        } catch (err) {
          const backendErrors = err.errors || [];
          const firstErrorMessage =
            backendErrors.length > 0
              ? backendErrors[0].msg
              : "Registration failed";
          this.errorMessage = firstErrorMessage;
        }
      } else {
        this.errorMessage = "Passwords do not match";
      }
    },
  },
  mounted() {
    this.checkSession();
  },
  computed: {
    toggleMessage() {
      return this.isRegister
        ? this.stateObj.register.message
        : this.stateObj.login.message;
    },
  },
};
</script>

<style>
html,
body,
#app,
.v-application {
  margin: 0;
  padding: 0;
  height: 100vh;
  overflow: hidden;
}

.full-height {
  height: 100vh;
}

.dark-theme {
  background: linear-gradient(to right, #121212, #1e1e1e);
  display: flex;
  align-items: center;
  justify-content: center;
}

.form-container {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100vh;
}

.dark-card {
  background-color: #2c2c2c !important;
  color: #ffffff;
  padding: 16px;
  border-radius: 12px;
  width: 100%;
  max-width: 400px;
}

.dark-input .v-input__control {
  background-color: #424242 !important;
  color: #ffffff !important;
  border-radius: 8px;
}

.dark-input input {
  color: #ffffff !important;
}

.dark-input input:-webkit-autofill,
.dark-input input:-webkit-autofill:hover,
.dark-input input:-webkit-autofill:focus,
.dark-input input:-webkit-autofill:active {
  -webkit-text-fill-color: #ffffff !important;
  -webkit-box-shadow: 0 0 0px 1000px #424242 inset !important;
  transition: background-color 5000s ease-in-out 0s;
}

.dark-input .v-text-field__slot input:-webkit-autofill,
.dark-input .v-text-field__slot input:-webkit-autofill:hover,
.dark-input .v-text-field__slot input:-webkit-autofill:focus,
.dark-input .v-text-field__slot input:-webkit-autofill:active {
  -webkit-text-fill-color: #ffffff !important;
  -webkit-box-shadow: 0 0 0px 1000px #424242 inset !important;
  transition: background-color 5000s ease-in-out 0s;
}

.dark-button {
  background-color: #1565c0 !important;
  color: white !important;
}

.toggle-link {
  cursor: pointer;
  text-decoration: underline;
  color: #90caf9;
}

.toggle-link:hover {
  color: #64b5f6;
}

.red--text {
  color: red;
}
</style>
