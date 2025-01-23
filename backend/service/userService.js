const db = require("../db_config/dbInit");
require("dotenv").config();
const jwt = require("jsonwebtoken");

const jwtSecret = process.env.JWT_SECRET;
const jwtExpireTime = process.env.JWT_EXPIRES_TIME;

const bcrypt = require("bcrypt");

const getAllUsers = (req, res) => {
  res.send("you want to get all users");
};

const getOthers = async (req, res) => {
  const email = req.query.email;
  console.log(req.query);
  if (!email) {
    return res
      .status(400)
      .send({ message: "There is no email for getting other users" });
  }
  try {
    const querySnapshot = await db
      .collection("users")
      .where("email", "!=", email)
      .get();
    users = [];
    querySnapshot.forEach((doc) => {
      users.push(doc.data());
    });
    res.status(200).send(users);
  } catch (err) {
    res.status(500).send(JSON.stringify(err));
  }
};

const hashPassword = async (password) => {
  const saltRounds = 10;
  return await bcrypt.hash(password, saltRounds);
};

const verifyPassword = async (plainPassword, hashedPassword) => {
  return await bcrypt.compare(plainPassword, hashedPassword);
};

const registerUser = async (req, res) => {
  console.log(req.body);
  const { firstName, lastName, username, email, password } = req.body;

  if (!firstName || !lastName || !email) {
    return res.status(400).send({ message: "All fields are required" });
  }

  const newUser = {
    firstName: firstName,
    lastName: lastName,
    username: username,
    email: email,
    password: await hashPassword(password),
  };

  try {
    const addedUser = await db.collection("users").add(newUser);

    const userDoc = await addedUser.get();
    const userData = userDoc.data();

    console.log("New user ID:", addedUser.id);
    console.log("New user data:", userData);

    res.status(201).json({
      id: addedUser.id,
      ...userData,
    });
  } catch (error) {
    res.status(500).send(JSON.stringify(error));
  }
};

const loginUser = async (req, res) => {
  const { email, password } = req.body;

  const userToAuthenticate = {
    email: email,
    password: password,
  };

  const querySnapshot = await db
    .collection("users")
    .where("email", "==", userToAuthenticate.email)
    .limit(1)
    .get();

  if (querySnapshot.empty) {
    return res.status(401).send("Unauthorized");
  }

  const userData = querySnapshot.docs[0].data();

  const isPasswordValid = await verifyPassword(password, userData.password);

  if (isPasswordValid) {
    const token = jwt.sign({ email: email }, jwtSecret, {
      expiresIn: jwtExpireTime,
    });

    res.cookie("sessionToken", token, {
      httpOnly: true, // Prevent access via JavaScript
      maxAge: 3600000, // 1 hour in milliseconds
    });
    res.status(200).send({ username: userData.username });
  } else {
    res.status(401).send("Unauthorized");
  }
};

const logoutUser = async (req, res) => {
  try {
    const token = req.cookies["sessionToken"];
    if (!token) {
      return res.status(400).json({ message: "No token found in cookies" });
    }

    res.clearCookie("sessionToken", {
      httpOnly: true,
      sameSite: "strict", // Prevent CSRF attacks
    });
    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    console.error("Error during logout", error);
    res.status(500).json({ message: "Error during logout" });
  }
};

const checkEmailNotInUse = async (email) => {
  try {
    const usersRef = db.collection("users");
    const querySnapshot = await usersRef
      .where("email", "==", email)
      .limit(1)
      .get();

    if (!querySnapshot.empty) {
      return Promise.reject("Email already in use");
    }

    return true;
  } catch (error) {
    console.error("Error checking email:", error);
    throw error;
  }
};

const checkUsernameNotInUse = async (username) => {
  try {
    const usersRef = db.collection("users");
    const querySnapshot = await usersRef
      .where("username", "==", username)
      .limit(1)
      .get();

    if (!querySnapshot.empty) {
      return Promise.reject("Username already in use");
    }

    return true;
  } catch (error) {
    console.error("Error checking username:", error);
    throw error;
  }
};

module.exports = {
  getAllUsers,
  registerUser,
  loginUser,
  checkEmailNotInUse,
  checkUsernameNotInUse,
  getOthers,
  logoutUser,
};
