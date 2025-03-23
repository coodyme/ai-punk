import { Game } from './game.js';
import { connectToServer } from './utils/socket.js';

// DOM elements
const loginScreen = document.getElementById('login-screen');
const loginButton = document.getElementById('login-button');
const registerButton = document.getElementById('register-button');
const usernameInput = document.getElementById('username');
const passwordInput = document.getElementById('password');

// Game instance
let game = null;

// Handle login
loginButton.addEventListener('click', async () => {
    const username = usernameInput.value.trim();
    const password = passwordInput.value.trim();
    
    if (!username || !password) {
        alert('Please enter username and password');
        return;
    }
    
    try {
        const response = await fetch('/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            // Store token in local storage
            localStorage.setItem('gameToken', data.token);
            
            // Connect to game socket with token
            const socket = connectToServer(data.token);
            
            // Initialize game
            game = new Game(socket);
            
            // Hide login screen
            loginScreen.style.display = 'none';
        } else {
            alert(data.message || 'Login failed');
        }
    } catch (error) {
        console.error('Login error:', error);
        alert('Login failed. Please try again.');
    }
});

// Handle registration
registerButton.addEventListener('click', async () => {
    const username = usernameInput.value.trim();
    const password = passwordInput.value.trim();
    
    if (!username || !password) {
        alert('Please enter username and password');
        return;
    }
    
    try {
        const response = await fetch('/api/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            alert('Registration successful! You can now login.');
        } else {
            alert(data.message || 'Registration failed');
        }
    } catch (error) {
        console.error('Registration error:', error);
        alert('Registration failed. Please try again.');
    }
});

// Check if user is already logged in
window.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('gameToken');
    
    if (token) {
        // Connect to game socket with token
        const socket = connectToServer(token);
        
        // Test token validity
        socket.on('connect', () => {
            // Initialize game
            game = new Game(socket);
            
            // Hide login screen
            loginScreen.style.display = 'none';
        });
        
        socket.on('connect_error', () => {
            // Token invalid or expired
            localStorage.removeItem('gameToken');
            alert('Session expired. Please login again.');
        });
    }
});