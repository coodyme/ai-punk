import jwt from 'jsonwebtoken';
import { getConnection } from 'typeorm';
import Player from '../database/models/player.model.js';

/**
 * Authenticate a player using JWT token
 * @param {string} token - JWT token
 * @returns {Promise<Player>} Player data
 */
export const authenticatePlayer = async (token) => {
    try {
        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Get player from database
        const playerRepository = getConnection().getRepository(Player);
        const player = await playerRepository.findOne(decoded.id);
        
        if (!player) {
            throw new Error('Player not found');
        }
        
        // Don't send the password back
        delete player.password;
        
        return player;
    } catch (error) {
        throw new Error('Authentication failed: ' + error.message);
    }
};

/**
 * Handle player disconnection
 * @param {number} playerId - Player ID
 */
export const disconnectPlayer = async (playerId) => {
    try {
        // Update player's last online status in database
        const playerRepository = getConnection().getRepository(Player);
        await playerRepository.update(playerId, {
            lastOnline: new Date()
        });
    } catch (error) {
        console.error('Error updating player disconnection status:', error);
    }
};

/**
 * Get online players
 * @returns {Promise<Array>} Array of online players
 */
export const getOnlinePlayers = async () => {
    try {
        const playerRepository = getConnection().getRepository(Player);
        // Query logic to get online players
        const players = await playerRepository.find({
            where: {
                // Define your criteria for "online" players
            }
        });
        return players;
    } catch (error) {
        console.error('Error getting online players:', error);
        return [];
    }
};