import { EntitySchema } from 'typeorm';

// Define the schema without decorators
const Player = new EntitySchema({
  name: 'Player',
  tableName: 'players',
  columns: {
    id: {
      primary: true,
      type: 'int',
      generated: true
    },
    username: {
      type: 'varchar',
      unique: true,
      nullable: false
    },
    password: {
      type: 'varchar',
      nullable: false
    },
    email: {
      type: 'varchar',
      unique: true,
      nullable: false
    },
    role: {
      type: 'varchar',
      default: 'user'
    },
    uniqueId: {
      name: 'unique_id',
      type: 'varchar',
      unique: true,
      nullable: true,
      default: null // We'll generate this in the seed function instead
    },
    health: {
      type: 'int',
      default: 100
    },
    stamina: {
      type: 'int',
      default: 100
    },
    // Add position field
    position: {
      type: 'jsonb',
      nullable: true,
      default: null // We'll set it explicitly in the seed function
    },
    inventory: {
      type: 'jsonb',
      default: '[]'
    },
    experience: {
      type: 'int',
      default: 0
    },
    level: {
      type: 'int',
      default: 0
    },
    createdAt: {
      name: 'created_at',
      type: 'timestamp',
      createDate: true
    }
  }
});

// Add player methods
Player.methods = {
  levelUp() {
    if (this.experience >= 100) {
      this.level += 1;
      this.experience = 0; // Reset experience after leveling up
    }
  }
};

export default Player;