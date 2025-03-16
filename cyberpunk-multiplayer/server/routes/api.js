const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const gameController = require('../controllers/gameController');
const playerController = require('../controllers/playerController');

// Authentication routes
router.post('/register', authController.register);
router.post('/login', authController.login);

// Game-related routes
router.get('/game/start', gameController.startGame);
router.post('/game/attack', gameController.attack);
router.post('/game/inventory', gameController.updateInventory);

// Player routes
router.get('/player/:id', playerController.getPlayer);
router.put('/player/:id', playerController.updatePlayer);

module.exports = router;