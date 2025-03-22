const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Player = require('../models/player');

const saltRounds = 10;
const jwtSecret = 'your_jwt_secret'; // Replace with your actual secret

const register = async (username, password) => {
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    const newPlayer = new Player({ username, password: hashedPassword });
    return await newPlayer.save();
};

const login = async (username, password) => {
    const player = await Player.findOne({ username });
    if (!player) {
        throw new Error('User not found');
    }
    const isMatch = await bcrypt.compare(password, player.password);
    if (!isMatch) {
        throw new Error('Invalid password');
    }
    const token = jwt.sign({ id: player._id }, jwtSecret, { expiresIn: '1h' });
    return { token, player };
};

const validateToken = (token) => {
    try {
        return jwt.verify(token, jwtSecret);
    } catch (error) {
        throw new Error('Invalid token');
    }
};

module.exports = {
    register,
    login,
    validateToken,
};