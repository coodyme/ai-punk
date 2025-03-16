export const attack = (attacker, defender) => {
    const damage = calculateDamage(attacker);
    defender.health -= damage;
    if (defender.health <= 0) {
        defender.health = 0;
        handleDefeat(defender);
    }
    return damage;
};

const calculateDamage = (attacker) => {
    // Basic damage calculation based on attacker's stats
    return Math.floor(Math.random() * attacker.attackPower) + 1;
};

const handleDefeat = (defender) => {
    // Logic for handling the defeat of an enemy
    console.log(`${defender.name} has been defeated!`);
    // Additional logic for dropping items or experience points can be added here
};

export const useItem = (player, item) => {
    if (player.inventory.includes(item)) {
        item.effect(player);
        removeItemFromInventory(player, item);
    }
};

const removeItemFromInventory = (player, item) => {
    const index = player.inventory.indexOf(item);
    if (index > -1) {
        player.inventory.splice(index, 1);
    }
};