import { io } from 'socket.io-client';

/**
 * Connect to the game server with authentication token
 * @param {string} token - Authentication token
 * @returns {Socket} Socket.io instance
 */
export function connectToServer(token) {
    const socket = io('/game', {
        auth: { token }
    });
    
    // Setup event handlers
    socket.on('connect', () => {
        console.log('Connected to game server');
    });
    
    socket.on('connect_error', (error) => {
        console.error('Connection error:', error.message);
        
        // If authentication failed, redirect to login
        if (error.message.includes('Authentication failed')) {
            localStorage.removeItem('gameToken');
            window.location.reload();
        }
    });
    
    socket.on('error', (data) => {
        console.error('Server error:', data.message);
    });
    
    return socket;
}

/**
 * Setup game-specific socket event handlers
 * @param {Socket} socket - Socket.io instance
 * @param {Object} gameState - Game state object
 */
export function setupGameSocketHandlers(socket, gameState) {
    socket.on('game:init', (data) => {
        console.log('Game initialized:', data);
        
        // Find own player data to set camera mode properly
        const ownPlayerData = data.players.find(p => p.id === socket.id);
        if (ownPlayerData) {
            // Set player data first to configure camera properly
            gameState.setPlayerData(ownPlayerData);
        }
        
        gameState.initializePlayers(data.players);
    });
    
    socket.on('player:joined', (data) => {
        console.log('Player joined:', data);
        gameState.addOtherPlayer(data);
    });
    
    socket.on('player:left', (data) => {
        console.log('Player left:', data);
        gameState.removeOtherPlayer(data.id);
    });
    
    socket.on('player:moved', (data) => {
        gameState.updateOtherPlayerPosition(data.id, data.position);
    });
    
    socket.on('player:damaged', (data) => {
        gameState.updatePlayerStatus(data.newHealth);
        gameState.showDamageEffect(data.damage);
    });
    
    socket.on('player:status', (data) => {
        gameState.updatePlayerStatus(data.health, data.stamina);
    });
    
    socket.on('player:levelup', (data) => {
        gameState.updatePlayerLevel(data.level);
        gameState.showLevelUpEffect();
    });
    
    socket.on('chat:message', (data) => {
        gameState.addChatMessage(data);
    });
    
    socket.on('inventory:update', (data) => {
        gameState.updateInventory(data.inventory);
    });
    
    socket.on('world:item:added', (data) => {
        gameState.addWorldItem(data);
    });
    
    socket.on('world:item:removed', (data) => {
        gameState.removeWorldItem(data.worldItemId);
    });
    
    socket.on('combat:event', (data) => {
        gameState.showCombatEffect(data);
    });
}