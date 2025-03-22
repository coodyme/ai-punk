class Item {
    constructor(name, grade, value) {
        this.name = name;
        this.grade = grade; // Grade 1, 2, or 3
        this.value = value; // Currency value
        this.isEquipped = false;
    }

    equip() {
        this.isEquipped = true;
    }

    unequip() {
        this.isEquipped = false;
    }

    use() {
        // Logic for using the item
        console.log(`Using item: ${this.name}`);
    }

    getDetails() {
        return {
            name: this.name,
            grade: this.grade,
            value: this.value,
            isEquipped: this.isEquipped
        };
    }
}

export default Item;