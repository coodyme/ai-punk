import { EntitySchema } from 'typeorm';

// Define role constants
export const ROLES = {
  ADMIN: 0,
  PLAYER: 1
};

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
      type: 'int',
      default: ROLES.PLAYER  // Default to regular player
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
    lastOnline: {
      name: 'last_online',
      type: 'timestamp',
      nullable: true,
      default: null
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
  },
  
  // Add a method to check if player is admin
  isAdmin() {
    return this.role === ROLES.ADMIN;
  }
};

export default Player;