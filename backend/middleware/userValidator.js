const { body } = require('express-validator');

const { checkEmailNotInUse } = require('../userManagement/userService')

const userValidationRules = () => {
    return [
        body('email', 'Invalid email').trim().isEmail().normalizeEmail().custom(checkEmailNotInUse),
        body('password', 'Password must be at least 8 characters long').isLength({ min: 8 }).trim()
    ];
};

const loginValidationRules = () => {
    return [
        body('email', 'Invalid email').trim().isEmail().normalizeEmail(),
    ];
};

module.exports = {
    userValidationRules,
    loginValidationRules
};