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
    uniqueId: {
      name: 'unique_id',
      type: 'varchar',
      unique: true,
      nullable: false
    },
    health: {
      type: 'int',
      default: 100
    },
    stamina: {
      type: 'int',
      default: 100
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