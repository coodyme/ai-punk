import { handlePlayerMovement } from './handlers/movement.handler.js';
import { handleCombat } from './handlers/combat.handler.js';
import { handleItemInteraction } from './handlers/item.handler.js';
import { handleChat } from './handlers/chat.handler.js';
import { authenticatePlayer, disconnectPlayer } from './handlers/player.handler.js';

/**
 * Initialize game server with socket.io
 * @param {Server} io - Socket.IO server instance
 */
const initializeGameServer = (io) => {
    // Create a specific namespace for the game
    const gameNamespace = io.of('/game');
    
    // Authentication middleware for sockets
    gameNamespace.use(async (socket, next) => {
        // Get token from handshake
        const token = socket.handshake.auth.token;
        if (!token) {
            return next(new Error('Authentication token is required'));
        }
        
        try {
            // Verify player and attach player data to socket
            const player = await authenticatePlayer(token);
            socket.player = player;
            next();
        } catch (error) {
            next(new Error('Authentication failed: ' + error.message));
        }
    });

    // Handle socket connections
    gameNamespace.on('connection', (socket) => {
        console.log(`Player connected to game: ${socket.player.username} (${socket.id})`);
        
        // Notify other players about new player
        socket.broadcast.emit('player:joined', {
            id: socket.player.id,
            username: socket.player.username,
            position: socket.player.position || { x: 0, y: 0, z: 0 },
        });
        
        // Send existing players to the new player
        const playersData = getActivePlayersData(gameNamespace);
        socket.emit('game:init', { players: playersData });
        
        // Movement events
        socket.on('player:move', (data) => handlePlayerMovement(socket, gameNamespace, data));
        
        // Combat events
        socket.on('player:attack', (data) => handleCombat(socket, gameNamespace, data));
        
        // Item interaction events
        socket.on('player:item:use', (data) => handleItemInteraction(socket, gameNamespace, data, 'use'));
        socket.on('player:item:pickup', (data) => handleItemInteraction(socket, gameNamespace, data, 'pickup'));
        socket.on('player:item:drop', (data) => handleItemInteraction(socket, gameNamespace, data, 'drop'));
        
        // Chat events
        socket.on('chat:message', (data) => handleChat(socket, gameNamespace, data));
        
        // Disconnect event
        socket.on('disconnect', () => {
            console.log(`Player disconnected: ${socket.player.username} (${socket.id})`);
            disconnectPlayer(socket.player.id);
            gameNamespace.emit('player:left', { id: socket.player.id });
        });
    });
};

/**
 * Get data for all active players
 * @param {Namespace} gameNamespace - Socket.IO game namespace
 * @returns {Array} Array of player data objects
 */
const getActivePlayersData = (gameNamespace) => {
    const players = [];
    gameNamespace.sockets.forEach((socket) => {
        if (socket.player) {
            // Debug the player role data being sent
            console.log(`Player ${socket.player.username} - Role: ${socket.player.role}, isAdmin set to: ${socket.player.role === 'admin'}`);
            
            players.push({
                id: socket.player.id,
                username: socket.player.username,
                position: socket.player.position || { x: 0, y: 0, z: 0 },
                health: socket.player.health,
                level: socket.player.level,
                isAdmin: socket.player.role === 'admin',
                role: socket.player.role // Also send the actual role for debugging
            });
        }
    });
    return players;
};

export default initializeGameServer;