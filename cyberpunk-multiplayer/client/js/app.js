const socket = io(); // Initialize Socket.io

// Game variables
let player;
let enemies = [];
let items = [];
let gameLoop;

// Initialize the game
function init() {
    setupSocketListeners();
    createPlayer();
    createEnemies();
    createItems();
    startGameLoop();
}

// Setup Socket.io listeners
function setupSocketListeners() {
    socket.on('playerUpdate', updatePlayer);
    socket.on('enemyUpdate', updateEnemies);
    socket.on('itemUpdate', updateItems);
}

// Create player instance
function createPlayer() {
    player = new Player();
}

// Create enemies
function createEnemies() {
    for (let i = 0; i < 5; i++) {
        enemies.push(new Enemy());
    }
}

// Create items
function createItems() {
    for (let i = 0; i < 10; i++) {
        items.push(new Item());
    }
}

// Start the game loop
function startGameLoop() {
    gameLoop = requestAnimationFrame(gameLoopFunction);
}

// Main game loop function
function gameLoopFunction() {
    update();
    render();
    gameLoop = requestAnimationFrame(gameLoopFunction);
}

// Update game state
function update() {
    player.update();
    enemies.forEach(enemy => enemy.update());
    items.forEach(item => item.update());
}

// Render the game
function render() {
    // Call rendering functions from the rendering module
    city.render();
    effects.render();
}

// Start the game
init();