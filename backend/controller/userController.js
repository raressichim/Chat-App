const express = require("express");
const router = express.Router();
const userService = require("../service/userService");
const { verifyToken } = require("../middleware/verifyToken");
const { verifySession } = require("../middleware/verifySession");
const {
  userValidationRules,
  loginValidationRules,
} = require("../middleware/userValidator");
const { validate } = require("../middleware/validate");

router.get("/users", verifyToken, userService.getAllUsers);
router.post(
  "/users",
  userValidationRules(),
  validate,
  userService.registerUser
);
router.post("/login", loginValidationRules(), validate, userService.loginUser);
router.get("/users/others", verifyToken, userService.getOthers);
router.post("/logout", verifyToken, userService.logoutUser);
router.get("/session", verifySession);

module.exports = router;
