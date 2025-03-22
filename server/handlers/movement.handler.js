import { getConnection } from 'typeorm';
import Player from '../database/models/player.model.js';

/**
 * Handle player movement
 * @param {Socket} socket - Player's socket
 * @param {Namespace} namespace - Game namespace
 * @param {Object} data - Movement data
 */
export const handlePlayerMovement = async (socket, namespace, data) => {
    try {
        // Validate movement data
        if (!isValidMovement(data)) {
            socket.emit('error', { message: 'Invalid movement data' });
            return;
        }
        
        // Update player position
        socket.player.position = {
            x: data.x,
            y: data.y,
            z: data.z,
            rotation: data.rotation
        };
        
        // Broadcast player movement to other players
        socket.broadcast.emit('player:moved', {
            id: socket.player.id,
            position: socket.player.position
        });
        
        // Save player position to database (periodically to avoid too many writes)
        // Using a simple throttling mechanism
        if (shouldUpdateDatabase(socket)) {
            const playerRepository = getConnection().getRepository(Player);
            await playerRepository.update(socket.player.id, {
                position: socket.player.position
            });
        }
    } catch (error) {
        console.error('Error handling player movement:', error);
        socket.emit('error', { message: 'Error processing movement' });
    }
};

/**
 * Check if movement data is valid
 * @param {Object} data - Movement data
 * @returns {boolean} True if movement is valid
 */
const isValidMovement = (data) => {
    // Perform validations based on game rules
    // Check for speed hacking, teleporting, wall clipping, etc.
    if (!data || typeof data.x !== 'number' || typeof data.y !== 'number' || typeof data.z !== 'number') {
        return false;
    }
    
    // Add more complex validations as needed
    return true;
};

/**
 * Determine if we should update the database with player position
 * @param {Socket} socket - Player's socket
 * @returns {boolean} True if database update should occur
 */
const shouldUpdateDatabase = (socket) => {
    // Store last update time on socket to throttle database writes
    const now = Date.now();
    if (!socket.lastPositionUpdate || now - socket.lastPositionUpdate > 10000) { // 10 seconds
        socket.lastPositionUpdate = now;
        return true;
    }
    return false;
};