class Enemy {
    constructor(id, name, health, stamina, position) {
        this.id = id;
        this.name = name;
        this.health = health;
        this.stamina = stamina;
        this.position = position;
        this.level = 1;
        this.grade = this.assignGrade();
    }

    assignGrade() {
        const grades = ['Grade 1', 'Grade 2', 'Grade 3'];
        return grades[Math.floor(Math.random() * grades.length)];
    }

    takeDamage(amount) {
        this.health -= amount;
        if (this.health < 0) {
            this.health = 0;
        }
    }

    regenerateStamina(amount) {
        this.stamina += amount;
        if (this.stamina > 100) {
            this.stamina = 100;
        }
    }

    attack(target) {
        if (this.stamina > 0) {
            const damage = this.calculateDamage();
            target.takeDamage(damage);
            this.stamina -= 10; // Example stamina cost for an attack
        }
    }

    calculateDamage() {
        return this.level * 5; // Example damage calculation based on level
    }

    isAlive() {
        return this.health > 0;
    }
}

export default Enemy;