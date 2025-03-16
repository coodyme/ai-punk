class Player {
    constructor(name, password) {
        this.name = name;
        this.password = password;
        this.id = this.generateUniqueId();
        this.health = 100;
        this.stamina = 100;
        this.inventory = [];
        this.experience = 0;
        this.level = 0;
    }

    generateUniqueId() {
        return 'player-' + Math.random().toString(36).substr(2, 9);
    }

    takeDamage(amount) {
        this.health -= amount;
        if (this.health < 0) {
            this.health = 0;
        }
    }

    regenerateHealth() {
        if (this.health < 100) {
            this.health += 1; // Regenerate health over time
        }
    }

    useStamina(amount) {
        this.stamina -= amount;
        if (this.stamina < 0) {
            this.stamina = 0;
        }
    }

    regenerateStamina() {
        if (this.stamina < 100) {
            this.stamina += 1; // Regenerate stamina over time
        }
    }

    addItem(item) {
        this.inventory.push(item);
    }

    levelUp() {
        if (this.experience >= 100) {
            this.level += 1;
            this.experience = 0; // Reset experience after leveling up
        }
    }

    attack(target) {
        // Implement attack logic here
    }
}

export default Player;