<template>
  <v-app>
    <v-main>
      <v-container fluid fill-height>
        <v-row align="center" justify="center" class="fill-height">
          <v-col cols="12" sm="8" md="6" lg="4">
            <v-card class="elevation-12">
              <v-toolbar dark color="primary">
                <v-toolbar-title
                  >{{
                    isRegister ? stateObj.register.name : stateObj.login.name
                  }}
                  form</v-toolbar-title
                >
              </v-toolbar>
              <v-card-text>
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
                    required
                  ></v-text-field>

                  <v-text-field
                    v-if="isRegister"
                    v-model="lastName"
                    name="LastName"
                    label="Last Name"
                    type="text"
                    placeholder="Last Name"
                    required
                  ></v-text-field>

                  <v-text-field
                    v-if="isRegister"
                    v-model="username"
                    name="Username"
                    label="Username"
                    type="text"
                    placeholder="Username"
                    required
                  ></v-text-field>

                  <v-text-field
                    v-model="email"
                    name="email"
                    label="Email"
                    type="text"
                    placeholder="Email"
                    required
                  ></v-text-field>

                  <v-text-field
                    v-model="password"
                    name="password"
                    label="Password"
                    type="password"
                    placeholder="password"
                    required
                  ></v-text-field>

                  <v-text-field
                    v-if="isRegister"
                    v-model="confirmPassword"
                    name="confirmPassword"
                    label="Confirm Password"
                    type="password"
                    placeholder="confirm password"
                    required
                  ></v-text-field>

                  <div class="red--text">{{ errorMessage }}</div>
                  <v-btn
                    type="submit"
                    class="mt-4"
                    color="primary"
                    value="log in"
                  >
                    {{
                      isRegister ? stateObj.register.name : stateObj.login.name
                    }}
                  </v-btn>
                  <div
                    class="toggle-link grey--text mt-4"
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
    async login() {
      try {
        const response = await loginUser(this.email, this.password);
        if (response) {
          this.errorMessage = "";
          this.username = response.username;
          console.log("The user " + this.username + " just logged in");
          this.$store.dispatch("updateSharedData", this.email);
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
.v-card {
  padding: 16px;
  border-radius: 12px;
}

.v-container {
  height: 100vh;
}

.toggle-link {
  cursor: pointer;
  text-decoration: underline;
}

.toggle-link:hover {
  color: #1976d2;
}
.red--text {
  color: red;
}
</style>
