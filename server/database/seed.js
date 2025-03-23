import dotenv from 'dotenv';
import initializeDatabase from './connection.js';
import Player from './models/player.model.js';
import Item from './models/item.model.js';
import World from './models/world.model.js';
import bcrypt from 'bcrypt';

// Load environment variables
dotenv.config();

async function seed() {
    console.log('Starting database seeding...');
    
    try {
        // Create a connection to the database using the existing configuration
        const connection = await initializeDatabase();
        console.log('Database connected');
        
        // Seed worlds
        await seedWorlds(connection);
        
        // Seed items
        await seedItems(connection);
        
        // Seed players
        await seedPlayers(connection);
        
        // Close the connection
        await connection.close();
        console.log('Seeding completed successfully!');
    } catch (error) {
        console.error('Error during seeding:', error);
        process.exit(1);
    }
}

async function seedWorlds(connection) {
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
            ]
        }
    ];
    
    await worldRepository.save(worlds);
    console.log('Worlds seeded successfully!');
}

async function seedItems(connection) {
    console.log('Seeding items...');
    
    const itemRepository = connection.getRepository(Item);
    const itemCount = await itemRepository.count();
    
    if (itemCount > 0) {
        console.log('Items already seeded, skipping...');
        return;
    }
    
    const items = [
        {
            name: 'Laser Gun',
            description: 'A powerful weapon that shoots laser beams',
            damage: 50,
            rarity: 'Rare',
            type: 'weapon', // Add type to match the enum in the model
            grade: 3 // Add grade to match the model
        }
    ];
    
    await itemRepository.save(items);
    console.log('Items seeded successfully!');
}

async function seedPlayers(connection) {
    console.log('Seeding players...');
    
    const playerRepository = connection.getRepository(Player);
    
    // Delete all existing players
    await playerRepository.clear();
    console.log('Cleared existing players');
    
    const players = [
        {
            username: 'admin',
            password: await bcrypt.hash('admin123', 10),
            email: 'admin@example.com',
            role: 'admin',
            uniqueId: `admin_${Date.now()}`,
            position: JSON.stringify({ x: 10, y: 0, z: 10, rotation: 0 })
        },
        {
            username: 'player1',
            password: await bcrypt.hash('player123', 10),
            email: 'player1@example.com',
            role: 'player',
            uniqueId: `player1_${Date.now()}`,
            position: JSON.stringify({ x: 10, y: 0, z: 10, rotation: 0 })
        }
    ];
    
    await playerRepository.save(players);
    console.log('Players seeded successfully!');
}

seed();