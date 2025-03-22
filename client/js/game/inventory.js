export class Inventory {
    constructor() {
        this.items = [];
    }

    addItem(item) {
        this.items.push(item);
    }

    removeItem(itemId) {
        this.items = this.items.filter(item => item.id !== itemId);
    }

    getItems() {
        return this.items;
    }

    findItem(itemId) {
        return this.items.find(item => item.id === itemId);
    }

    clearInventory() {
        this.items = [];
    }
}