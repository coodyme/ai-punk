const Player = require('../models/player');
const bcrypt = require('bcrypt');
const crypto = require('crypto');

module.exports = async (connection) => {
    console.log('Seeding players...');
    
    const playerRepository = connection.getRepository(Player);
    const playerCount = await playerRepository.count();
    
    if (playerCount > 0) {
        console.log('Players already seeded, skipping...');
        return;
    }
    
    // Create test players
    const players = [
        {
            username: 'admin',
            password: await bcrypt.hash('admin123', 10),
            uniqueId: crypto.randomUUID(),
            health: 100,
            stamina: 100,
            inventory: [],
            experience: 50,
            level: 5
        },
        {
            username: 'testplayer',
            password: await bcrypt.hash('test123', 10),
            uniqueId: crypto.randomUUID(),
            health: 100,
            stamina: 100,
            inventory: [
                { id: 1, name: 'Basic Katana', count: 1 },
                { id: 4, name: 'IA Blood', count: 100 }
            ],
            experience: 0,
            level: 1
        }
    ];
    
    await playerRepository.save(players);
    console.log(`${players.length} players seeded`);
};