<template>
    <v-app>
        <v-main>
            <v-container fluid fill-height>
                <v-row align="center" justify="center" class="fill-height">
                    <v-col cols="12" sm="8" md="6" lg="4">
                        <v-card class="elevation-12">
                            <v-toolbar dark color="primary">
                                <v-toolbar-title>{{ isRegister ? stateObj.register.name : stateObj.login.name }}
                                    form</v-toolbar-title>
                            </v-toolbar>
                            <v-card-text>
                                <form ref="form" @submit.prevent="isRegister ? register() : login()">
                                    <v-text-field v-if="isRegister" v-model="firstName" name="firstName"
                                        label="First Name" type="text" placeholder="First Name" required></v-text-field>

                                    <v-text-field v-if="isRegister" v-model="lastName" name="LastName" label="Last Name"
                                        type="text" placeholder="Last Name" required></v-text-field>

                                    <v-text-field v-model="email" name="email" label="Email" type="text"
                                        placeholder="Email" required></v-text-field>

                                    <v-text-field v-model="password" name="password" label="Password" type="password"
                                        placeholder="password" required></v-text-field>

                                    <v-text-field v-if="isRegister" v-model="confirmPassword" name="confirmPassword"
                                        label="Confirm Password" type="password" placeholder="confirm password"
                                        required></v-text-field>
                                    <div class="red--text"> {{ errorMessage }}</div>
                                    <v-btn type="submit" class="mt-4" color="primary" value="log in">
                                        {{ isRegister ? stateObj.register.name : stateObj.login.name }}
                                    </v-btn>
                                    <div class="toggle-link grey--text mt-4" v-on:click="isRegister = !isRegister;">
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
async function createUser(userData) {
    try {
        const response = await fetch("http://localhost:3000/users", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(userData)
        });

        if (response.ok) {
            const result = await response.json();
            console.log("User created successfully:", result);
        } else {
            const error = await response.json();
            console.error("Error creating user:", error);
        }
    } catch (err) {
        console.error("Network error:", err);
    }
}

async function loginUser(userData) {
    try {
        const response = await fetch("http://localhost:3000/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(userData)
        });

        if (response.ok) {
            const result = await response.json();
            console.log("User logged in successfully:", result);
        } else {
            const error = await response.json();
            console.error("Error logging in user:", error);
        }
    } catch (err) {
        console.error("Network error:", err);
    }
}

export default {
    name: "App",
    data() {
        return {
            email: "",
            password: "",
            confirmPassword: "",
            firstName: "",
            lastName: "",
            isRegister: false,
            errorMessage: "",
            stateObj: {
                register: {
                    name: 'Register',
                    message: 'Already have an account? Login.'
                },
                login: {
                    name: 'Login',
                    message: 'Register'
                }
            }
        };
    },
    methods: {
        login() {
            const userData = {
                email: this.email,
                password: this.password
            };

            loginUser(userData)
                .then(() => {
                    this.errorMessage = "";
                    this.$router.replace({ name: "dashboard", params: { userData } });
                })
                .catch(err => {
                    this.errorMessage = "Failed to login user. Please try again.";
                    console.error("Error during loggin in:", err);
                });
        },
        register() {
            if (this.password === this.confirmPassword) {
                const userData = {
                    firstName: this.firstName,
                    lastName: this.lastName,
                    email: this.email,
                    password: this.password
                };

                createUser(userData)
                    .then(() => {
                        this.isRegister = false;
                        this.errorMessage = "";
                        this.$refs.form.reset();
                    })
                    .catch(err => {
                        this.errorMessage = "Failed to register user. Please try again.";
                        console.error("Error during registration:", err);
                    });
            } else {
                this.errorMessage = "Passwords do not match";
            }
        }
    },
    computed: {
        toggleMessage() {
            return this.isRegister ? this.stateObj.register.message : this.stateObj.login.message;
        }
    }
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
</style>
