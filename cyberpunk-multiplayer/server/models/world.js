const mongoose = require('mongoose');

const worldSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    description: {
        type: String,
        required: true
    },
    dimensions: {
        width: {
            type: Number,
            required: true
        },
        height: {
            type: Number,
            required: true
        },
        depth: {
            type: Number,
            required: true
        }
    },
    spawnPoints: [{
        x: {
            type: Number,
            required: true
        },
        y: {
            type: Number,
            required: true
        },
        z: {
            type: Number,
            required: true
        }
    }],
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const World = mongoose.model('World', worldSchema);

module.exports = World;