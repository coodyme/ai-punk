const World = require('../models/world');

module.exports = async (connection) => {
    console.log('Seeding worlds...');
    
    const worldRepository = connection.getRepository(World);
    const worldCount = await worldRepository.count();
    
    if (worldCount > 0) {
        console.log('Worlds already seeded, skipping...');
        return;
    }
    
    const worlds = [
        {
            name: 'Neon City',
            description: 'A vibrant cyberpunk metropolis with towering skyscrapers and neon lights',
            dimensions: {
                width: 1000,
                height: 500,
                depth: 1000
            },
            spawnPoints: [
                { x: 10, y: 0, z: 10 },
                { x: 50, y: 0, z: 50 }
            ]
        },
        {
            name: 'Underground District',
            description: 'The hidden underworld beneath Neon City where illegal activities flourish',
            dimensions: {
                width: 800,
                height: 300,
                depth: 800
            },
            spawnPoints: [
                { x: 20, y: 0, z: 20 },
                { x: 40, y: 0, z: 60 }
            ]
        }
    ];
    
    await worldRepository.save(worlds);
    console.log(`${worlds.length} worlds seeded`);
};