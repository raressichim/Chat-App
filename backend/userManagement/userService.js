const db = require('../db_config/dbInit')
require('dotenv').config();
const jwt = require('jsonwebtoken');

const jwtSecret = process.env.JWT_SECRET
const jwtExpireTime = process.env.JWT_EXPIRES_TIME

const getAllUsers = (req, res) => {
    res.send('you want to get all users')
}
const registerUser = async (req, res) => {
    const { firstName, lastName, email, password } = req.body

    if (!firstName || !lastName || !email) {
        return res.status(400).send({ message: "All fields are required" });
    }

    const newUser = {
        firstName: firstName,
        lastName: lastName,
        email: email,
        password: password
    }

    try {
        const addedUser = await db.collection('users').add(newUser)

        const userDoc = await addedUser.get()
        const userData = userDoc.data()

        console.log('New user ID:', addedUser.id)
        console.log('New user data:', userData)

        res.status(201).json({
            id: addedUser.id,
            ...userData
        })

    } catch (error) {
        res.status(500).send(JSON.stringify(error))
    }

}
const loginUser = async (req, res) => {
    const { email, password } = req.body

    const userToAuthenticate = {
        email: email,
        password: password
    }

    let auth = false

    const querySnapshot = await db.collection('users').where('email', '==', userToAuthenticate.email).limit(1).get();

    querySnapshot.forEach(element => {
        console.log('A user matching the email address has been found.')
        const userData = element.data()

        if (userData.password === userToAuthenticate.password) auth = true
    });

    if (auth) {
        const token = jwt.sign({ email: email }, jwtSecret, { expiresIn: jwtExpireTime });

        res.cookie('sessionToken', token, {
            httpOnly: true, // Prevent access via JavaScript
            maxAge: 3600000, // 1 hour in milliseconds
        });
        res.status(200).send('Authorized')
    } else {
        res.status(401).send('Unauthorized')
    }
}

const checkEmailNotInUse = async (email) => {
    try {
        const usersRef = db.collection('users');
        const querySnapshot = await usersRef.where('email', '==', email).limit(1).get();

        if (!querySnapshot.empty) {
            return Promise.reject('Email already in use');
        }

        return true

    } catch (error) {
        console.error("Error checking email:", error);
        throw error;
    }

}

module.exports = {
    getAllUsers,
    registerUser,
    loginUser,
    checkEmailNotInUse
}