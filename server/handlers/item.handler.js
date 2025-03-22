import { getConnection } from 'typeorm';
import Player from '../database/models/player.model.js';
import { calculateHealth, calculateStamina } from '../utils/helpers.js';

/**
 * Handle item interactions (use, pickup, drop)
 * @param {Socket} socket - Player's socket
 * @param {Namespace} namespace - Game namespace
 * @param {Object} data - Item interaction data
 * @param {string} action - Type of interaction (use, pickup, drop)
 */
export const handleItemInteraction = async (socket, namespace, data, action) => {
    try {
        if (!isValidItemInteraction(data, action)) {
            socket.emit('error', { message: 'Invalid item interaction data' });
            return;
        }

        switch(action) {
            case 'use':
                await handleItemUse(socket, namespace, data);
                break;
            case 'pickup':
                await handleItemPickup(socket, namespace, data);
                break;
            case 'drop':
                await handleItemDrop(socket, namespace, data);
                break;
            default:
                socket.emit('error', { message: 'Unknown item action' });
        }
    } catch (error) {
        console.error(`Error handling item ${action}:`, error);
        socket.emit('error', { message: `Error during item ${action}` });
    }
};

/**
 * Validate if item interaction is legitimate
 * @param {Object} data - Item interaction data
 * @param {string} action - Type of interaction
 * @returns {boolean} True if interaction is valid
 */
const isValidItemInteraction = (data, action) => {
    if (!data) return false;

    switch(action) {
        case 'use':
            return data.itemId !== undefined && Number.isInteger(data.inventoryIndex);
        case 'pickup':
            return data.worldItemId !== undefined && data.position;
        case 'drop':
            return data.itemId !== undefined && 
                Number.isInteger(data.inventoryIndex) && 
                data.position;
        default:
            return false;
    }
};

/**
 * Handle item use
 * @param {Socket} socket - Player's socket
 * @param {Namespace} namespace - Game namespace
 * @param {Object} data - Item data
 */
const handleItemUse = async (socket, namespace, data) => {
    const player = socket.player;
    const { itemId, inventoryIndex } = data;
    
    // Check if player has this item in inventory at specified index
    if (!player.inventory[inventoryIndex] || player.inventory[inventoryIndex].id !== itemId) {
        socket.emit('error', { message: 'Item not found in inventory at specified position' });
        return;
    }
    
    const item = player.inventory[inventoryIndex];
    
    // Apply item effects based on item type
    switch(item.type) {
        case 'consumable':
            await applyConsumableEffect(socket, item, inventoryIndex);
            break;
        case 'weapon':
            await equipWeapon(socket, item, inventoryIndex);
            break;
        default:
            socket.emit('error', { message: `Cannot use item of type: ${item.type}` });
            return;
    }
    
    // Update client with new inventory state
    socket.emit('inventory:update', { inventory: player.inventory });
};

/**
 * Apply consumable item effect
 * @param {Socket} socket - Player's socket
 * @param {Object} item - Item data
 * @param {number} inventoryIndex - Index in inventory
 */
const applyConsumableEffect = async (socket, item, inventoryIndex) => {
    const player = socket.player;
    let updated = false;
    
    // Apply effect based on item name or properties
    if (item.name === 'Health Potion' || item.properties?.restoresHealth) {
        // Restore health
        const healAmount = item.properties?.healAmount || 25;
        player.health = calculateHealth(player.health + healAmount, 100);
        updated = true;
    } else if (item.name === 'Stamina Booster' || item.properties?.restoresStamina) {
        // Restore stamina
        const staminaAmount = item.properties?.staminaAmount || 25;
        player.stamina = calculateStamina(player.stamina + staminaAmount, 100);
        updated = true;
    }
    
    if (updated) {
        // Remove item after use (if quantity > 1, decrease quantity)
        if (player.inventory[inventoryIndex].quantity > 1) {
            player.inventory[inventoryIndex].quantity -= 1;
        } else {
            player.inventory.splice(inventoryIndex, 1);
        }
        
        // Update player in database
        const playerRepository = getConnection().getRepository(Player);
        await playerRepository.update(player.id, {
            health: player.health,
            stamina: player.stamina,
            inventory: player.inventory
        });
        
        // Notify client of health/stamina change
        socket.emit('player:status', {
            health: player.health,
            stamina: player.stamina
        });
    }
};

/**
 * Equip weapon
 * @param {Socket} socket - Player's socket
 * @param {Object} weapon - Weapon data
 * @param {number} inventoryIndex - Index in inventory
 */
const equipWeapon = async (socket, weapon, inventoryIndex) => {
    const player = socket.player;
    
    // Find currently equipped weapon (if any)
    const equippedIndex = player.inventory.findIndex(i => i.equipped && i.type === 'weapon');
    
    // Unequip current weapon if any
    if (equippedIndex >= 0) {
        player.inventory[equippedIndex].equipped = false;
    }
    
    // Equip new weapon
    player.inventory[inventoryIndex].equipped = true;
    
    // Update player in database
    const playerRepository = getConnection().getRepository(Player);
    await playerRepository.update(player.id, {
        inventory: player.inventory
    });
    
    // Broadcast weapon change to nearby players
    socket.broadcast.emit('player:equip', {
        playerId: player.id,
        weapon: {
            id: weapon.id,
            name: weapon.name
        }
    });
};

/**
 * Handle item pickup
 * @param {Socket} socket - Player's socket
 * @param {Namespace} namespace - Game namespace
 * @param {Object} data - Item data
 */
const handleItemPickup = async (socket, namespace, data) => {
    const { worldItemId, position } = data;
    const player = socket.player;
    
    // Check if item exists in world at the specified position
    const worldItem = await getWorldItem(worldItemId, position);
    if (!worldItem) {
        socket.emit('error', { message: 'Item not found at this position' });
        return;
    }
    
    // Check if player has space in inventory
    if (player.inventory.length >= 20) { // Assuming max inventory size is 20
        socket.emit('error', { message: 'Inventory is full' });
        return;
    }
    
    // Add item to player's inventory
    const newItem = {
        id: worldItem.id,
        name: worldItem.name,
        type: worldItem.type,
        grade: worldItem.grade || 1,
        quantity: 1
    };
    
    // Check if item is stackable and if player already has it
    const existingItemIndex = player.inventory.findIndex(i => 
        i.id === newItem.id && i.type === 'consumable'
    );
    
    if (existingItemIndex >= 0) {
        player.inventory[existingItemIndex].quantity += 1;
    } else {
        player.inventory.push(newItem);
    }
    
    // Update player in database
    const playerRepository = getConnection().getRepository(Player);
    await playerRepository.update(player.id, {
        inventory: player.inventory
    });
    
    // Remove item from world
    await removeWorldItem(worldItemId);
    
    // Notify player of successful pickup
    socket.emit('item:pickup:success', { item: newItem });
    
    // Notify nearby players that item was picked up
    socket.broadcast.emit('world:item:removed', {
        worldItemId: worldItemId,
        pickedBy: player.id
    });
};

/**
 * Handle item drop
 * @param {Socket} socket - Player's socket
 * @param {Namespace} namespace - Game namespace
 * @param {Object} data - Item data
 */
const handleItemDrop = async (socket, namespace, data) => {
    const { itemId, inventoryIndex, position } = data;
    const player = socket.player;
    
    // Check if player has this item in inventory at specified index
    if (!player.inventory[inventoryIndex] || player.inventory[inventoryIndex].id !== itemId) {
        socket.emit('error', { message: 'Item not found in inventory at specified position' });
        return;
    }
    
    const item = player.inventory[inventoryIndex];
    
    // Create a new world item
    const worldItemId = await createWorldItem({
        itemId: item.id,
        name: item.name,
        type: item.type,
        grade: item.grade,
        position: position
    });
    
    // Remove item from player's inventory
    if (item.quantity > 1) {
        player.inventory[inventoryIndex].quantity -= 1;
    } else {
        player.inventory.splice(inventoryIndex, 1);
    }
    
    // Update player in database
    const playerRepository = getConnection().getRepository(Player);
    await playerRepository.update(player.id, {
        inventory: player.inventory
    });
    
    // Notify player of successful drop
    socket.emit('inventory:update', { inventory: player.inventory });
    
    // Notify nearby players that item was dropped
    namespace.emit('world:item:added', {
        worldItemId: worldItemId,
        itemId: item.id,
        name: item.name,
        type: item.type,
        position: position,
        droppedBy: player.id
    });
};

/**
 * Get item from world
 * @param {string|number} worldItemId - World item ID
 * @param {Object} position - Position object
 * @returns {Promise<Object|null>} Item or null if not found
 */
const getWorldItem = async (worldItemId, position) => {
    // This implementation depends on how you're storing world items
    // It could be in memory, database, or a combination
    
    // Example implementation assuming world items are stored in database
    // or a game state manager
    
    try {
        // Placeholder - replace with actual implementation
        return {
            id: 101,
            worldItemId: worldItemId,
            name: 'Health Potion',
            type: 'consumable',
            grade: 1
        };
    } catch (error) {
        console.error('Error fetching world item:', error);
        return null;
    }
};

/**
 * Remove item from world
 * @param {string|number} worldItemId - World item ID
 * @returns {Promise<boolean>} Success status
 */
const removeWorldItem = async (worldItemId) => {
    // Implementation depends on your world item storage system
    
    // This is a placeholder that returns success
    return true;
};

/**
 * Create item in world
 * @param {Object} itemData - Item data
 * @returns {Promise<string|number>} Created world item ID
 */
const createWorldItem = async (itemData) => {
    // Implementation depends on your world item storage system
    
    // This is a placeholder that returns a new ID
    return 'world-item-' + Date.now();
};