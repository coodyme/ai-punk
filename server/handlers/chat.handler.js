/**
 * Handle chat messages
 * @param {Socket} socket - Player's socket
 * @param {Namespace} namespace - Game namespace
 * @param {Object} data - Chat message data
 */
export const handleChat = async (socket, namespace, data) => {
    try {
        // Validate chat data
        if (!isValidChatMessage(data)) {
            socket.emit('error', { message: 'Invalid chat message' });
            return;
        }

        const player = socket.player;
        const { message, type = 'global', targetId = null } = data;
        
        // Format the message
        const formattedMessage = {
            id: generateMessageId(),
            senderId: player.id,
            senderName: player.username,
            message: sanitizeMessage(message),
            timestamp: Date.now(),
            type: type
        };
        
        // Handle different chat types
        switch (type) {
            case 'global':
                // Send to all players
                namespace.emit('chat:message', formattedMessage);
                break;
                
            case 'local':
                // Only send to players within a certain range
                // (we'd need position data to calculate this)
                const nearbyPlayers = findNearbyPlayers(namespace, socket.player.position, 50);
                nearbyPlayers.forEach(nearbySocket => {
                    nearbySocket.emit('chat:message', formattedMessage);
                });
                // Always send to self
                socket.emit('chat:message', formattedMessage);
                break;
                
            case 'private':
                // Send to specific player
                if (!targetId) {
                    socket.emit('error', { message: 'Target ID required for private messages' });
                    return;
                }
                
                const targetSocket = findSocketByPlayerId(namespace, targetId);
                if (!targetSocket) {
                    socket.emit('error', { message: 'Player not found or offline' });
                    return;
                }
                
                // Add recipient info to private messages
                formattedMessage.recipientId = targetId;
                formattedMessage.recipientName = targetSocket.player.username;
                
                // Send to recipient and sender
                targetSocket.emit('chat:message', formattedMessage);
                socket.emit('chat:message', formattedMessage);
                break;
                
            case 'guild':
                // First, check if player is in a guild
                if (!player.guildId) {
                    socket.emit('error', { message: 'You are not in a guild' });
                    return;
                }
                
                // Send to all guild members
                const guildMembers = findGuildMembers(namespace, player.guildId);
                guildMembers.forEach(memberSocket => {
                    memberSocket.emit('chat:message', formattedMessage);
                });
                break;
                
            default:
                socket.emit('error', { message: 'Unknown chat type' });
        }
        
        // Log chat message (optional)
        logChatMessage(formattedMessage);
        
    } catch (error) {
        console.error('Error handling chat message:', error);
        socket.emit('error', { message: 'Error processing chat message' });
    }
};

/**
 * Validate chat message
 * @param {Object} data - Chat message data
 * @returns {boolean} True if valid
 */
const isValidChatMessage = (data) => {
    // Check if message exists and is not empty
    if (!data || !data.message || typeof data.message !== 'string') {
        return false;
    }
    
    // Check message length
    if (data.message.trim().length === 0 || data.message.length > 500) {
        return false;
    }
    
    // If it's a private message, check for target ID
    if (data.type === 'private' && !data.targetId) {
        return false;
    }
    
    return true;
};

/**
 * Generate unique message ID
 * @returns {string} Message ID
 */
const generateMessageId = () => {
    return 'msg-' + Date.now() + '-' + Math.floor(Math.random() * 1000);
};

/**
 * Sanitize message to prevent XSS and other injections
 * @param {string} message - Raw message
 * @returns {string} Sanitized message
 */
const sanitizeMessage = (message) => {
    // Simple HTML escaping
    return message
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
};

/**
 * Find nearby players based on position
 * @param {Namespace} namespace - Game namespace
 * @param {Object} position - Player position
 * @param {number} radius - Radius to check
 * @returns {Array} Array of nearby player sockets
 */
const findNearbyPlayers = (namespace, position, radius) => {
    const nearbyPlayers = [];
    
    namespace.sockets.forEach((socket) => {
        if (socket.player && socket.player.position) {
            const distance = calculateDistance(position, socket.player.position);
            if (distance <= radius) {
                nearbyPlayers.push(socket);
            }
        }
    });
    
    return nearbyPlayers;
};

/**
 * Calculate distance between two positions
 * @param {Object} pos1 - First position
 * @param {Object} pos2 - Second position
 * @returns {number} Distance
 */
const calculateDistance = (pos1, pos2) => {
    const dx = pos1.x - pos2.x;
    const dy = pos1.y - pos2.y;
    const dz = pos1.z - pos2.z;
    return Math.sqrt(dx * dx + dy * dy + dz * dz);
};

/**
 * Find socket by player ID
 * @param {Namespace} namespace - Game namespace
 * @param {string|number} playerId - Player ID
 * @returns {Socket|null} Socket or null if not found
 */
const findSocketByPlayerId = (namespace, playerId) => {
    let targetSocket = null;
    namespace.sockets.forEach((socket) => {
        if (socket.player && socket.player.id === playerId) {
            targetSocket = socket;
        }
    });
    return targetSocket;
};

/**
 * Find all guild members
 * @param {Namespace} namespace - Game namespace
 * @param {string|number} guildId - Guild ID
 * @returns {Array} Array of guild member sockets
 */
const findGuildMembers = (namespace, guildId) => {
    const guildMembers = [];
    
    namespace.sockets.forEach((socket) => {
        if (socket.player && socket.player.guildId === guildId) {
            guildMembers.push(socket);
        }
    });
    
    return guildMembers;
};

/**
 * Log chat message to database or file
 * @param {Object} message - Formatted message
 */
const logChatMessage = (message) => {
    // This could save messages to database, write to log file, etc.
    // For now, just console log
    if (process.env.NODE_ENV === 'development') {
        console.log(`[${new Date().toISOString()}] [${message.type}] ${message.senderName}: ${message.message}`);
    }
};