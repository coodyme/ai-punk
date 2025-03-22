export class Progression {
    constructor() {
        this.level = 0;
        this.experience = 0;
        this.maxLevel = 100;
        this.experienceToLevelUp = 100; // Example value, can be adjusted
    }

    addExperience(amount) {
        this.experience += amount;
        this.checkLevelUp();
    }

    checkLevelUp() {
        while (this.experience >= this.experienceToLevelUp && this.level < this.maxLevel) {
            this.experience -= this.experienceToLevelUp;
            this.level++;
            this.onLevelUp();
        }
    }

    onLevelUp() {
        console.log(`Congratulations! You've reached level ${this.level}!`);
        this.experienceToLevelUp = this.calculateExperienceToLevelUp();
    }

    calculateExperienceToLevelUp() {
        // Example formula for experience needed to level up
        return 100 + this.level * 20; // Adjust as necessary for game balance
    }

    getLevel() {
        return this.level;
    }

    getExperience() {
        return this.experience;
    }
}