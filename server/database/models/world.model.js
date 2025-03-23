import { EntitySchema } from 'typeorm';

const World = new EntitySchema({
  name: 'World',
  tableName: 'worlds',
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
    dimensions: {
      type: 'jsonb',
      nullable: false
    },
    spawnPoints: {
      type: 'jsonb',
      nullable: false
    },
    createdAt: {
      name: 'created_at',
      type: 'timestamp',
      createDate: true
    }
  }
});

export default World;