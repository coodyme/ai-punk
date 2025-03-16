const mongoose = require('mongoose');

const playerSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    uniqueId: {
        type: String,
        required: true,
        unique: true
    },
    health: {
        type: Number,
        default: 100
    },
    stamina: {
        type: Number,
        default: 100
    },
    inventory: {
        type: Array,
        default: []
    },
    experience: {
        type: Number,
        default: 0
    },
    level: {
        type: Number,
        default: 0
    }
});

playerSchema.methods.levelUp = function() {
    if (this.experience >= 100) {
        this.level += 1;
        this.experience = 0; // Reset experience after leveling up
    }
};

const Player = mongoose.model('Player', playerSchema);

module.exports = Player;