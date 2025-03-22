import { getConnection } from 'typeorm';
import Player from '../database/models/player.model.js';
import { calculateDamage } from '../utils/gameUtils.js';
import { calculateHealth } from '../utils/helpers.js';

/**
 * Handle combat interactions between players or with NPCs
 * @param {Socket} socket - Player's socket initiating the attack
 * @param {Namespace} namespace - Game namespace
 * @param {Object} data - Attack data
 */
export const handleCombat = async (socket, namespace, data) => {
    try {
        // Validate attack data
        if (!isValidAttack(data, socket.player)) {
            socket.emit('error', { message: 'Invalid attack data' });
            return;
        }

        const attackerId = socket.player.id;
        const targetId = data.targetId;
        const weaponId = data.weaponId;
        
        // Check if target exists (player or NPC)
        const target = await getTarget(targetId);
        if (!target) {
            socket.emit('error', { message: 'Target not found' });
            return;
        }
        
        // Get weapon data
        const weapon = socket.player.inventory.find(item => item.id === weaponId);
        if (!weapon) {
            socket.emit('error', { message: 'Weapon not found in inventory' });
            return;
        }
        
        // Calculate damage based on weapon, attacker stats, target defense, etc.
        const damage = calculateDamage({
            weapon: weapon,
            attackerLevel: socket.player.level,
            targetDefense: target.defense || 0,
            isCritical: Math.random() < 0.1 // 10% critical chance
        });
        
        // Update target health
        const newHealth = calculateHealth(target.health - damage, target.maxHealth || 100);
        target.health = newHealth;
        
        // If target is a player, update their data
        if (target.type === 'player') {
            // Find target socket
            const targetSocket = findSocketByPlayerId(namespace, targetId);
            if (targetSocket) {
                targetSocket.player.health = newHealth;
                targetSocket.emit('player:damaged', {
                    attackerId: attackerId,
                    damage: damage,
                    newHealth: newHealth
                });
            }
            
            // Update in database
            const playerRepository = getConnection().getRepository(Player);
            await playerRepository.update(targetId, { health: newHealth });
            
            // Check if target is defeated
            if (newHealth <= 0) {
                handlePlayerDefeat(socket, targetSocket, namespace);
            }
        } else {
            // Handle NPC combat logic
            handleNPCCombat(socket, namespace, target, damage, newHealth);
        }
        
        // Broadcast combat event to nearby players
        broadcastCombatEvent(socket, namespace, {
            attackerId: attackerId,
            targetId: targetId,
            weapon: weapon.name,
            damage: damage,
            position: data.position
        });
        
        // Return success response to attacker
        socket.emit('combat:result', {
            success: true,
            targetId: targetId,
            damage: damage,
            targetHealth: newHealth
        });
    } catch (error) {
        console.error('Error in combat handler:', error);
        socket.emit('error', { message: 'Combat error occurred' });
    }
};

/**
 * Validate if attack is legitimate
 * @param {Object} data - Attack data
 * @param {Object} player - Player data
 * @returns {boolean} True if attack is valid
 */
const isValidAttack = (data, player) => {
    // Check if data contains required fields
    if (!data || !data.targetId || !data.weaponId || !data.position) {
        return false;
    }
    
    // Check if player has enough stamina for attack
    if (player.stamina < 10) {
        return false;
    }
    
    // Check if player and target are within combat range
    // This would require having both positions and calculating distance
    
    return true;
};

/**
 * Get target player or NPC by ID
 * @param {string|number} targetId - ID of target
 * @returns {Promise<Object>} Target data
 */
const getTarget = async (targetId) => {
    // If targetId starts with 'npc-', it's an NPC
    if (typeof targetId === 'string' && targetId.startsWith('npc-')) {
        // Fetch NPC data from game state or database
        // This is a placeholder - implement based on your NPC system
        return {
            id: targetId,
            type: 'npc',
            name: 'NPC Enemy',
            health: 100,
            maxHealth: 100,
            defense: 5
        };
    }
    
    // Otherwise it's a player
    const playerRepository = getConnection().getRepository(Player);
    const player = await playerRepository.findOne(targetId);
    
    if (player) {
        player.type = 'player';
        return player;
    }
    
    return null;
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
 * Handle player defeat
 * @param {Socket} attackerSocket - Attacker's socket
 * @param {Socket} targetSocket - Target's socket
 * @param {Namespace} namespace - Game namespace
 */
const handlePlayerDefeat = async (attackerSocket, targetSocket, namespace) => {
    // Award experience to attacker
    const expGain = Math.floor(targetSocket.player.level * 10);
    attackerSocket.player.experience += expGain;
    
    // Check if attacker leveled up
    if (attackerSocket.player.experience >= attackerSocket.player.level * 100) {
        attackerSocket.player.level += 1;
        attackerSocket.player.experience = 0;
        attackerSocket.emit('player:levelup', { 
            level: attackerSocket.player.level 
        });
    }
    
    // Update attacker in database
    const playerRepository = getConnection().getRepository(Player);
    await playerRepository.update(attackerSocket.player.id, {
        experience: attackerSocket.player.experience,
        level: attackerSocket.player.level
    });
    
    // Respawn defeated player
    targetSocket.player.health = 100; // Reset health
    targetSocket.player.position = getRandomRespawnPoint();
    
    // Update target in database
    await playerRepository.update(targetSocket.player.id, {
        health: targetSocket.player.health,
        position: targetSocket.player.position
    });
    
    // Notify target about defeat
    targetSocket.emit('player:defeated', {
        attackerId: attackerSocket.player.id,
        respawnPosition: targetSocket.player.position
    });
    
    // Broadcast defeat event
    namespace.emit('player:defeat', {
        defeated: targetSocket.player.id,
        defeatedBy: attackerSocket.player.id
    });
};

/**
 * Handle NPC combat logic
 * @param {Socket} socket - Player's socket
 * @param {Namespace} namespace - Game namespace
 * @param {Object} npc - NPC data
 * @param {number} damage - Damage dealt
 * @param {number} newHealth - New NPC health
 */
const handleNPCCombat = (socket, namespace, npc, damage, newHealth) => {
    // Check if NPC is defeated
    if (newHealth <= 0) {
        // Award experience and potentially loot
        const expGain = Math.floor(npc.level * 15);
        socket.player.experience += expGain;
        
        // Check if player leveled up
        if (socket.player.experience >= socket.player.level * 100) {
            socket.player.level += 1;
            socket.player.experience = 0;
            socket.emit('player:levelup', { 
                level: socket.player.level 
            });
        }
        
        // Generate loot
        const loot = generateNPCLoot(npc);
        if (loot) {
            socket.emit('npc:loot', {
                npcId: npc.id,
                items: loot
            });
        }
        
        // Broadcast NPC defeat
        namespace.emit('npc:defeated', {
            npcId: npc.id,
            defeatedBy: socket.player.id
        });
    } else {
        // NPC is still alive, might counterattack
        // This would be implemented based on your NPC AI system
    }
};

/**
 * Broadcast combat event to nearby players
 * @param {Socket} socket - Player's socket
 * @param {Namespace} namespace - Game namespace
 * @param {Object} eventData - Combat event data
 */
const broadcastCombatEvent = (socket, namespace, eventData) => {
    // In a real implementation, you might filter this based on distance
    // to only send to players in the vicinity
    socket.broadcast.emit('combat:event', eventData);
};

/**
 * Generate random respawn point
 * @returns {Object} Position object
 */
const getRandomRespawnPoint = () => {
    // This would be based on your game world configuration
    const respawnPoints = [
        { x: 10, y: 0, z: 10 },
        { x: 50, y: 0, z: 50 },
        { x: 100, y: 0, z: 20 }
    ];
    
    return respawnPoints[Math.floor(Math.random() * respawnPoints.length)];
};

/**
 * Generate loot from defeated NPC
 * @param {Object} npc - NPC data
 * @returns {Array} Array of loot items
 */
const generateNPCLoot = (npc) => {
    // This would be based on your loot tables and game economy
    // Simple placeholder implementation
    const lootChance = Math.random();
    
    if (lootChance > 0.7) {
        return [{
            id: 101,
            name: 'Health Potion',
            type: 'consumable',
            quantity: 1
        }];
    }
    
    return [];
};