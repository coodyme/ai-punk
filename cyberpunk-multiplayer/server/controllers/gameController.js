const GameService = require('../services/gameService');

exports.startGame = (req, res) => {
    const playerId = req.body.playerId;
    // Logic to initialize game state for the player
    GameService.initializePlayerGameState(playerId)
        .then(gameState => res.status(200).json(gameState))
        .catch(err => res.status(500).json({ error: err.message }));
};

exports.handleCombat = (req, res) => {
    const { playerId, enemyId } = req.body;
    // Logic to handle combat between player and enemy
    GameService.processCombat(playerId, enemyId)
        .then(combatResult => res.status(200).json(combatResult))
        .catch(err => res.status(500).json({ error: err.message }));
};

exports.collectItem = (req, res) => {
    const { playerId, itemId } = req.body;
    // Logic to handle item collection
    GameService.addItemToPlayerInventory(playerId, itemId)
        .then(inventory => res.status(200).json(inventory))
        .catch(err => res.status(500).json({ error: err.message }));
};

exports.getPlayerStatus = (req, res) => {
    const playerId = req.params.playerId;
    // Logic to retrieve player status
    GameService.getPlayerStatus(playerId)
        .then(status => res.status(200).json(status))
        .catch(err => res.status(500).json({ error: err.message }));
};