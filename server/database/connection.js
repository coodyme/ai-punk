import "reflect-metadata";
import { createConnection } from 'typeorm';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

dotenv.config();

export const initializeDatabase = async () => {
    try {
        const connection = await createConnection({
            type: 'postgres',
            host: process.env.DB_HOST || 'localhost',
            port: parseInt(process.env.DB_PORT) || 5432,
            username: process.env.DB_USERNAME || '',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_DATABASE || '',
            entities: [
                path.join(rootDir, 'database/models', '*.js')
            ],
            migrations: [
                path.join(rootDir, 'migrations', '*.js')
            ],
            synchronize: process.env.NODE_ENV !== 'production',
            //logging: process.env.NODE_ENV === 'development'
        });
        
        console.log('Database connected successfully');
        return connection;
    } catch (error) {
        console.error('Database connection failed:', error);
        throw error;
    }
};

export default initializeDatabase;
