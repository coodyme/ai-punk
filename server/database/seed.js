import dotenv from 'dotenv';
import { createConnection } from 'typeorm';
import { Player } from '../models/player.js';
import { Item } from '../models/item.js';
import { World } from '../models/world.js';
import bcrypt from 'bcrypt';

// Load environment variables
dotenv.config();

async function seed() {
    console.log('Starting database seeding...');
    
    try {
        // Create a connection to the database
        const connection = await createConnection();
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
            rarity: 'Rare'
        }
    ];
    
    await itemRepository.save(items);
    console.log('Items seeded successfully!');
}

async function seedPlayers(connection) {
    console.log('Seeding players...');
    
    const playerRepository = connection.getRepository(Player);
    const playerCount = await playerRepository.count();
    
    if (playerCount > 0) {
        console.log('Players already seeded, skipping...');
        return;
    }
    
    const players = [
        {
            username: 'admin',
            password: await bcrypt.hash('admin123', 10),
            email: 'admin@example.com',
            role: 'admin'
        }
    ];
    
    await playerRepository.save(players);
    console.log('Players seeded successfully!');
}

seed();