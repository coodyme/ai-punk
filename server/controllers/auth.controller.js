import Player from '../database/models/player.model.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { getConnection } from 'typeorm';

const register = async (req, res) => {
    const { username, password } = req.body;

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        
        // Create a new user instance
        const newUser = new Player();
        newUser.username = username;
        newUser.password = hashedPassword;
        newUser.uniqueId = crypto.randomUUID(); // Make sure crypto is imported
        
        // For TypeORM, we use the repository pattern
        const userRepository = getConnection().getRepository(Player);
        await userRepository.save(newUser);
        
        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error registering user', error: error.message });
    }
};

const login = async (req, res) => {
    const { username, password } = req.body;

    try {
        // For TypeORM, use the repository to find the user
        const userRepository = getConnection().getRepository(Player);
        const user = await userRepository.findOne({ where: { username } });
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Changed from user._id to user.id for TypeORM
        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.status(200).json({ token });
    } catch (error) {
        res.status(500).json({ message: 'Error logging in', error: error.message });
    }
};

export { register, login };