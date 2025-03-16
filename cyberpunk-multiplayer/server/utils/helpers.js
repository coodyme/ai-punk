module.exports = {
    generateUniqueId: () => {
        return 'id-' + Math.random().toString(36).substr(2, 16);
    },

    validateUsername: (username) => {
        const regex = /^[a-zA-Z0-9_]{3,16}$/;
        return regex.test(username);
    },

    validatePassword: (password) => {
        const minLength = 6;
        return password.length >= minLength;
    },

    calculateHealth: (currentHealth, maxHealth) => {
        return Math.max(0, Math.min(currentHealth, maxHealth));
    },

    calculateStamina: (currentStamina, maxStamina) => {
        return Math.max(0, Math.min(currentStamina, maxStamina));
    },

    randomItemDrop: (drops) => {
        const totalWeight = drops.reduce((sum, drop) => sum + drop.weight, 0);
        const random = Math.random() * totalWeight;
        let cumulativeWeight = 0;

        for (const drop of drops) {
            cumulativeWeight += drop.weight;
            if (random < cumulativeWeight) {
                return drop.item;
            }
        }
    }
};