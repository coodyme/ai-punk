import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import apiRoutes from './routes/api.js';
import initializeGameServer from './game-server.js';
import { initializeDatabase } from './database/connection.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Initialize Express app for API endpoints
const app = express();
const server = createServer(app);
const io = new Server(server);

// Database initialization
initializeDatabase()
    .then(() => console.log('Database connected successfully'))
    .catch(err => console.error('Database connection failed:', err));

// Express middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/api', apiRoutes);

// API-specific error handling
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ 
        message: 'Something went wrong with the API',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// Initialize game server logic with socket.io
initializeGameServer(io);

// Start server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`- API available at http://localhost:${PORT}/api`);
    console.log(`- Game socket available at ws://localhost:${PORT}`);
});