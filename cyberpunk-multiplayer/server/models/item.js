const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    grade: {
        type: Number,
        required: true,
        enum: [1, 2, 3] // Grade 1, 2, or 3
    },
    type: {
        type: String,
        required: true,
        enum: ['weapon', 'currency', 'consumable'] // Types of items
    },
    description: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const Item = mongoose.model('Item', itemSchema);

module.exports = Item;