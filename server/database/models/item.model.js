import { EntitySchema } from 'typeorm';

const Item = new EntitySchema({
  name: 'Item',
  tableName: 'items',
  columns: {
    id: {
      primary: true,
      type: 'int',
      generated: true
    },
    name: {
      type: 'varchar',
      unique: true,
      nullable: false
    },
    description: {
      type: 'text',
      nullable: false
    },
    // Add these fields to match your seed data
    damage: {
      type: 'int',
      nullable: true,
      default: 0
    },
    rarity: {
      type: 'varchar',
      nullable: true
    },
    // Keep these existing fields but make them nullable
    grade: {
      type: 'int',
      nullable: true,
      default: 1
    },
    type: {
      type: 'enum',
      enum: ['weapon', 'currency', 'consumable'],
      nullable: true,
      default: 'weapon'
    },
    createdAt: {
      name: 'created_at',
      type: 'timestamp',
      createDate: true
    }
  }
});

export default Item;