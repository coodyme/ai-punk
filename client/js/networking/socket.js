const socket = io('https://your-server-url'); // Replace with your server URL

// Function to emit player movement
function emitPlayerMovement(playerId, position) {
    socket.emit('playerMovement', { playerId, position });
}

// Function to listen for player movements
function listenForPlayerMovements(callback) {
    socket.on('playerMovement', (data) => {
        callback(data);
    });
}

// Function to emit player actions (e.g., attack)
function emitPlayerAction(playerId, action) {
    socket.emit('playerAction', { playerId, action });
}

// Function to listen for player actions
function listenForPlayerActions(callback) {
    socket.on('playerAction', (data) => {
        callback(data);
    });
}

// Function to emit player connection
function emitPlayerConnect(playerId) {
    socket.emit('playerConnect', { playerId });
}

// Function to listen for new players connecting
function listenForPlayerConnects(callback) {
    socket.on('playerConnect', (data) => {
        callback(data);
    });
}

// Function to emit player disconnection
function emitPlayerDisconnect(playerId) {
    socket.emit('playerDisconnect', { playerId });
}

// Function to listen for player disconnections
function listenForPlayerDisconnects(callback) {
    socket.on('playerDisconnect', (data) => {
        callback(data);
    });
}

export {
    emitPlayerMovement,
    listenForPlayerMovements,
    emitPlayerAction,
    listenForPlayerActions,
    emitPlayerConnect,
    listenForPlayerConnects,
    emitPlayerDisconnect,
    listenForPlayerDisconnects
};