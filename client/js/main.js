// Entry point for the client-side application
import { initGame } from './app.js';
import { setupSocket } from './networking/socket.js';
import { loadAssets } from './assets/index.js';

// Initialize the game
async function main() {
    await loadAssets();
    setupSocket();
    initGame();
}

// Start the application
main();