/**
 * Generate a random unique ID
 * @returns {string} A unique identifier
 */
export const generateUniqueId = () => {
    return 'id-' + Math.random().toString(36).substr(2, 16);
};

/**
 * Validate a username format
 * @param {string} username The username to validate
 * @returns {boolean} True if valid, false otherwise
 */
export const validateUsername = (username) => {
    const regex = /^[a-zA-Z0-9_]{3,16}$/;
    return regex.test(username);
};

/**
 * Validate password meets minimum requirements
 * @param {string} password The password to validate
 * @returns {boolean} True if valid, false otherwise
 */
export const validatePassword = (password) => {
    const minLength = 6;
    return password.length >= minLength;
};

/**
 * Calculate health amount after damage/healing, respecting min/max boundaries
 * @param {number} newHealthValue - The calculated new health value
 * @param {number} maxHealth - Maximum health value
 * @param {number} [minHealth=0] - Minimum health value, defaults to 0
 * @returns {number} The bounded health value
 */
export const calculateHealth = (newHealthValue, maxHealth, minHealth = 0) => {
  // Ensure health doesn't go below minimum (usually 0)
  if (newHealthValue < minHealth) {
    return minHealth;
  }
  
  // Ensure health doesn't exceed maximum
  if (newHealthValue > maxHealth) {
    return maxHealth;
  }
  
  // Return the health value, rounded to avoid floating point issues
  return Math.round(newHealthValue * 10) / 10;
};

/**
 * Calculate stamina value within bounds
 * @param {number} currentStamina Current stamina value
 * @param {number} maxStamina Maximum possible stamina
 * @returns {number} Calculated stamina value
 */
export const calculateStamina = (currentStamina, maxStamina) => {
    return Math.max(0, Math.min(currentStamina, maxStamina));
};

/**
 * Random weighted item drop generator
 * @param {Array} drops Array of objects with item and weight properties
 * @returns {Object} Selected item based on weight probabilities
 */
export const randomItemDrop = (drops) => {
    const totalWeight = drops.reduce((sum, drop) => sum + drop.weight, 0);
    const random = Math.random() * totalWeight;
    let cumulativeWeight = 0;

    for (const drop of drops) {
        cumulativeWeight += drop.weight;
        if (random < cumulativeWeight) {
            return drop.item;
        }
    }
};

// If you need a default export for backward compatibility
export default {
    generateUniqueId,
    validateUsername,
    validatePassword,
    calculateHealth,
    calculateStamina,
    randomItemDrop
};