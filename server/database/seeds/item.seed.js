const Item = require('../models/item');

module.exports = async (connection) => {
    console.log('Seeding items...');
    
    const itemRepository = connection.getRepository(Item);
    const itemCount = await itemRepository.count();
    
    if (itemCount > 0) {
        console.log('Items already seeded, skipping...');
        return;
    }
    
    const items = [
        {
            name: 'Basic Katana',
            grade: 1,
            type: 'weapon',
            description: 'A standard katana with moderate damage'
        },
        {
            name: 'Cyber Blade',
            grade: 2,
            type: 'weapon',
            description: 'Enhanced blade with digital enhancements'
        },
        {
            name: 'Quantum Sword',
            grade: 3,
            type: 'weapon',
            description: 'Advanced weapon using quantum technology'
        },
        {
            name: 'IA Blood',
            grade: 1,
            type: 'currency',
            description: 'The standard currency in this world'
        },
        {
            name: 'Health Stim',
            grade: 1,
            type: 'consumable',
            description: 'Restores 25 health points'
        }
    ];
    
    await itemRepository.save(items);
    console.log(`${items.length} items seeded`);
};