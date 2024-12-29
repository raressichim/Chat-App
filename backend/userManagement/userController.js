const express = require('express')
const router = express.Router();
const userService = require('./userService')
const { userValidationRules, loginValidationRules } = require('../middleware/userValidator')
const { validate } = require('../middleware/validate')

router.get('/users', userService.getAllUsers);
router.post('/users', userValidationRules(), validate, userService.registerUser);
router.post('/login', loginValidationRules(), validate, userService.loginUser);

module.exports = router