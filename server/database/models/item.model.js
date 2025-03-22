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
    grade: {
      type: 'int',
      nullable: false
    },
    type: {
      type: 'enum',
      enum: ['weapon', 'currency', 'consumable'],
      nullable: false
    },
    description: {
      type: 'text',
      nullable: false
    },
    createdAt: {
      name: 'created_at',
      type: 'timestamp',
      createDate: true
    }
  }
});

export default Item;