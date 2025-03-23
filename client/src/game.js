import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { InputHandler } from './engine/input.js';
import { Player, ROLES } from './entities/player.js';
import { WorldManager } from './entities/world.js';
import { setupGameSocketHandlers } from './utils/socket.js';
import OtherPlayer from './entities/other-player.js';
import { TopDownCamera } from './engine/topDownCamera.js';
import { FreeCamera } from './engine/freeCamera.js';

export class Game {
    constructor(socket) {
        this.socket = socket;
        
        // Game state
        this.player = null;
        this.otherPlayers = new Map();
        this.world = null;
        
        // Three.js components
        this.scene = new THREE.Scene();
        this.camera = null;
        this.renderer = null;
        this.controls = null;
        this.topDownCamera = null;
        this.freeCamera = null;
        
        // Set to topDown by default for safety - will be updated when player data is received
        this.activeCamera = 'topDown';
        this.cameraToggleEnabled = false;
        
        // Game state
        this.health = 100;
        this.stamina = 100;
        this.level = 0;
        this.inventory = [];
        
        // Initialize the game
        this.initialize();
        
        // Setup socket event handlers
        setupGameSocketHandlers(this.socket, this);
    }
    
    initialize() {
        // Create renderer
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.shadowMap.enabled = true;
        document.body.appendChild(this.renderer.domElement);
        
        // Create camera
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.camera.position.set(0, 5, 10);
        
        // Add lights
        const ambientLight = new THREE.AmbientLight(0x404040, 1);
        this.scene.add(ambientLight);
        
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
        directionalLight.position.set(0, 100, 0);
        directionalLight.castShadow = true;
        directionalLight.shadow.mapSize.width = 2048;
        directionalLight.shadow.mapSize.height = 2048;
        this.scene.add(directionalLight);
        
        // Add debug controls (temporary for development)
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enabled = false; // Disable controls by default, camera will follow player

        // Add a key listener to toggle camera only for admins
        window.addEventListener('keydown', (event) => {
            if (event.key === 'c') {
                // Enhanced debugging
                console.log('C key pressed.');
                console.log(`Player exists: ${this.player ? 'Yes' : 'No'}`);
                console.log(`Player role: ${this.player?.role}, isAdmin: ${this.player?.isAdmin}`);
                
                // Use loose equality or parseInt to handle potential string/number conversion issues
                const isAdmin = this.player && (parseInt(this.player.role) === ROLES.ADMIN);
                if (isAdmin) {
                    console.log('Admin access granted - toggling camera');
                    this.toggleCamera();
                } else {
                    console.log('Camera toggle denied - user is not admin');
                }
            }
        });
        
        // Initialize player
        this.player = new Player(this.scene, this.camera);
        
        // Initialize world
        this.world = new WorldManager(this.scene, this.socket);
        
        // Initialize input handler
        this.input = new InputHandler(this.player, this.socket);
        
        // Store the resize handler as a class property
        this.handleResize = () => {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        };

        // Use the stored handler for the event listener
        window.addEventListener('resize', this.handleResize);

        // Add logout button handler
        const logoutButton = document.getElementById('logout-button');
        if (logoutButton) {
            logoutButton.addEventListener('click', () => this.logout());
        }
        
        this.topDownCamera = new TopDownCamera(this.player, this.camera, {
            height: 15,           // Adjust to your preference
            angle: 75,            // 90 for direct top-down, lower for angled view
            smoothTime: 0.2,
            horizontalLookAhead: 3,
            verticalLookAhead: 3,
            angleFactor: 5
        });

        this.freeCamera = new FreeCamera(this.player, this.camera, this.renderer, this.controls);

        // Start game loop
        this.animate();
        
        // Update UI
        this.updateUI();
    }
    
    animate() {
        requestAnimationFrame(() => this.animate());
        
        // Only continue if the game is still active
        if (!this.renderer) return;
        
        // Update player
        if (this.player) {
            this.player.update(this.input.getMovementInput());
            
            // Update appropriate camera with better error handling
            try {
                if (this.activeCamera === 'topDown' && this.topDownCamera) {
                    this.topDownCamera.update(0.016);
                    if (this.freeCamera) this.freeCamera.setEnabled(false);
                } else if (this.activeCamera === 'free' && this.freeCamera) {
                    this.freeCamera.update(0.016);
                    this.freeCamera.setEnabled(true);
                }
            } catch (error) {
                console.error('Error updating camera:', error);
            }
            
            // Emit position update to server (throttled)
            if (this.player.shouldUpdateServer()) {
                this.socket.emit('player:move', this.player.getPositionUpdate());
            }
        }
        
        // Update other players
        for (const otherPlayer of this.otherPlayers.values()) {
            otherPlayer.update();
        }
        
        // Update world
        if (this.world && this.player) { // Add check for this.player here
            this.world.update(this.player.getPosition());
        }
        
        // Render scene (this.renderer is guaranteed to be non-null here)
        this.renderer.render(this.scene, this.camera);
    }
    
    // Game state initialization from server
    initializePlayers(players) {
        console.log('All received players data:', players);
        
        for (const playerData of players) {
            if (playerData.id !== this.player.id) {
                this.addOtherPlayer(playerData);
            } else {
                // Add more detailed logging before setting player data
                console.log('Current player data details:');
                console.log('- ID:', playerData.id);
                console.log('- Username:', playerData.username);
                console.log('- isAdmin:', playerData.isAdmin);
                console.log('- role:', playerData.role);
                
                // Update own player data
                this.player.setPlayerData(playerData);
                this.updatePlayerStatus(playerData.health, playerData.stamina);
                this.updatePlayerLevel(playerData.level);
            }
        }
    }
    
    // Add another player to the scene
    addOtherPlayer(playerData) {
        const otherPlayer = new OtherPlayer(this.scene, playerData);
        this.otherPlayers.set(playerData.id, otherPlayer);
    }
    
    // Remove player from scene
    removeOtherPlayer(playerId) {
        const otherPlayer = this.otherPlayers.get(playerId);
        if (otherPlayer) {
            otherPlayer.remove(this.scene);
            this.otherPlayers.delete(playerId);
        }
    }
    
    // Update other player's position
    updateOtherPlayerPosition(playerId, position) {
        const otherPlayer = this.otherPlayers.get(playerId);
        if (otherPlayer) {
            otherPlayer.setTargetPosition(position);
        }
    }
    
    // Update player health/stamina
    updatePlayerStatus(health, stamina) {
        if (health !== undefined) {
            this.health = health;
        }
        if (stamina !== undefined) {
            this.stamina = stamina;
        }
        this.updateUI();
    }
    
    // Update player level
    updatePlayerLevel(level) {
        this.level = level;
        document.getElementById('player-level').textContent = level;
    }
    
    // Update inventory
    updateInventory(inventory) {
        this.inventory = inventory;
        this.updateInventoryUI();
    }
    
    // Update UI elements
    updateUI() {
        document.getElementById('health-fill').style.width = `${this.health}%`;
        document.getElementById('stamina-fill').style.width = `${this.stamina}%`;
    }
    
    // Update inventory UI
    updateInventoryUI() {
        const inventoryContainer = document.getElementById('inventory');
        inventoryContainer.innerHTML = '';
        
        // Create 20 slots (5x4 grid)
        for (let i = 0; i < 20; i++) {
            const slot = document.createElement('div');
            slot.className = 'inventory-slot';
            
            if (this.inventory[i]) {
                // Display item
                slot.style.backgroundColor = this.getItemColor(this.inventory[i].type);
                slot.title = `${this.inventory[i].name} (${this.inventory[i].type})`;
                
                if (this.inventory[i].quantity > 1) {
                    slot.textContent = this.inventory[i].quantity;
                }
                
                // Add click event to use item
                slot.addEventListener('click', () => {
                    this.socket.emit('player:item:use', {
                        itemId: this.inventory[i].id,
                        inventoryIndex: i
                    });
                });
            }
            
            inventoryContainer.appendChild(slot);
        }
    }
    
    // Get color for item type
    getItemColor(type) {
        switch (type) {
            case 'weapon': return 'rgba(255, 0, 0, 0.5)';
            case 'consumable': return 'rgba(0, 255, 0, 0.5)';
            case 'currency': return 'rgba(255, 255, 0, 0.5)';
            default: return 'rgba(255, 255, 255, 0.5)';
        }
    }
    
    // Visual effects
    showDamageEffect(damage) {
        // Flash screen red when damaged
        const overlay = document.createElement('div');
        overlay.style.position = 'fixed';
        overlay.style.top = 0;
        overlay.style.left = 0;
        overlay.style.width = '100%';
        overlay.style.height = '100%';
        overlay.style.backgroundColor = 'rgba(255, 0, 0, 0.3)';
        overlay.style.pointerEvents = 'none';
        overlay.style.zIndex = 1000;
        document.body.appendChild(overlay);
        
        // Show damage number
        const damageText = document.createElement('div');
        damageText.textContent = `-${damage}`;
        damageText.style.position = 'fixed';
        damageText.style.top = '50%';
        damageText.style.left = '50%';
        damageText.style.transform = 'translate(-50%, -50%)';
        damageText.style.color = 'red';
        damageText.style.fontSize = '24px';
        damageText.style.fontWeight = 'bold';
        damageText.style.pointerEvents = 'none';
        damageText.style.zIndex = 1001;
        document.body.appendChild(damageText);
        
        // Remove after animation
        setTimeout(() => {
            document.body.removeChild(overlay);
            document.body.removeChild(damageText);
        }, 500);
    }
    
    showLevelUpEffect() {
        // Display level up message
        const levelUpText = document.createElement('div');
        levelUpText.textContent = 'LEVEL UP!';
        levelUpText.style.position = 'fixed';
        levelUpText.style.top = '40%';
        levelUpText.style.left = '50%';
        levelUpText.style.transform = 'translate(-50%, -50%)';
        levelUpText.style.color = '#0ff';
        levelUpText.style.fontSize = '36px';
        levelUpText.style.fontWeight = 'bold';
        levelUpText.style.textShadow = '0 0 10px #0ff';
        levelUpText.style.pointerEvents = 'none';
        levelUpText.style.zIndex = 1001;
        document.body.appendChild(levelUpText);
        
        // Animate and remove
        let opacity = 1;
        const fadeOut = setInterval(() => {
            opacity -= 0.02;
            levelUpText.style.opacity = opacity;
            
            if (opacity <= 0) {
                clearInterval(fadeOut);
                document.body.removeChild(levelUpText);
            }
        }, 30);
    }
    
    showCombatEffect(data) {
        // Create effect at position
        if (data.position) {
            const position = new THREE.Vector3(data.position.x, data.position.y, data.position.z);
            
            // Create particle effect
            const particles = new THREE.Points(
                new THREE.BufferGeometry(),
                new THREE.PointsMaterial({
                    color: 0xff0000,
                    size: 0.5,
                    transparent: true
                })
            );
            
            // Create random particles in small area
            const particleCount = 20;
            const positions = new Float32Array(particleCount * 3);
            
            for (let i = 0; i < particleCount; i++) {
                const i3 = i * 3;
                positions[i3] = position.x + (Math.random() - 0.5) * 2;
                positions[i3 + 1] = position.y + Math.random() * 2;
                positions[i3 + 2] = position.z + (Math.random() - 0.5) * 2;
            }
            
            particles.geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
            this.scene.add(particles);
            
            // Animate and remove
            let scale = 1;
            const animate = () => {
                scale -= 0.05;
                if (scale <= 0) {
                    this.scene.remove(particles);
                    return;
                }
                
                particles.material.opacity = scale;
                
                requestAnimationFrame(animate);
            };
            animate();
        }
    }
    
    // Add world item to scene
    addWorldItem(data) {
        this.world.addWorldItem(data);
    }
    
    // Remove world item from scene
    removeWorldItem(worldItemId) {
        this.world.removeWorldItem(worldItemId);
    }
    
    // Add chat message
    addChatMessage(data) {
        // Create chat message element
        const chatMessage = document.createElement('div');
        chatMessage.textContent = `${data.senderName}: ${data.message}`;
        chatMessage.style.color = this.getChatColor(data.type);
        
        // Add to chat container (you'd need to create this in HTML)
        const chatContainer = document.getElementById('chat-container');
        if (chatContainer) {
            chatContainer.appendChild(chatMessage);
            chatContainer.scrollTop = chatContainer.scrollHeight;
            
            // Remove old messages if too many
            while (chatContainer.children.length > 50) {
                chatContainer.removeChild(chatContainer.firstChild);
            }
        }
    }
    
    // Get color for chat type
    getChatColor(type) {
        switch (type) {
            case 'global': return '#fff';
            case 'local': return '#aaf';
            case 'private': return '#faa';
            case 'guild': return '#afa';
            default: return '#fff';
        }
    }

    // Add this method to the Game class
    logout() {
        console.log('Logging out...');
        
        // Notify server about logout
        if (this.socket && this.socket.connected) {
            this.socket.emit('player:logout');
        }
        
        // Clean up resources
        // Remove event listeners
        window.removeEventListener('resize', this.handleResize);
        
        // Remove renderer from DOM - add parent check
        if (this.renderer && this.renderer.domElement) {
            const parent = this.renderer.domElement.parentNode;
            if (parent) {
                parent.removeChild(this.renderer.domElement);
            }
        }
        
        // Dispose of three.js resources
        if (this.renderer) {
            this.renderer.dispose();
            this.renderer = null;
        }
        
        // Clear player data
        this.player = null;
        this.otherPlayers.clear();
        
        // Disconnect socket
        if (this.socket) {
            this.socket.disconnect();
        }
        
        // Remove token from localStorage
        localStorage.removeItem('gameToken');
        
        // Show login screen again
        const loginScreen = document.getElementById('login-screen');
        if (loginScreen) {
            loginScreen.style.display = 'flex';
        }
        
        console.log('Logout complete');
    }

    // Add the toggleCamera method
    toggleCamera() {
        // Always convert role to number for comparison
        const isAdmin = this.player && (Number(this.player.role) === ROLES.ADMIN);
        if (!this.player || !isAdmin) {
            console.log('Camera toggle denied - user is not admin');
            return;
        }
        
        console.log(`Switching camera from ${this.activeCamera}`);
        
        // Release pointer lock before changing cameras
        if (document.pointerLockElement) {
            document.exitPointerLock();
        }
        
        // Store current camera mode to avoid race conditions
        const currentCamera = this.activeCamera;
        
        // Wait a brief moment for pointer lock to fully release
        setTimeout(() => {
            if (currentCamera === 'free') {
                this.activeCamera = 'topDown';
                this.freeCamera.setEnabled(false);
                console.log('Switched to topDown camera');
            } else {
                this.activeCamera = 'free';
                this.freeCamera.setEnabled(true);
                this.freeCamera.resetCameraPosition();
                console.log('Switched to free camera');
            }
        }, 100);
    }

    // Modify setPlayerData in the game class to set the initial camera mode based on admin status
    setPlayerData(playerData) {
        console.log('Setting player data in Game:', playerData);
        
        // Set player data (existing functionality)
        if (this.player) {
            this.player.setPlayerData(playerData);
        }
        
        // Always convert to Number for consistency
        const isAdmin = Number(playerData.role) === ROLES.ADMIN;
        console.log(`Role check: ${playerData.role} (${typeof playerData.role}) === ${ROLES.ADMIN} => ${isAdmin}`);
        
        if (isAdmin) {
            console.log('Admin user detected - starting with free camera');
            this.activeCamera = 'free';
            this.player.isAdmin = true;
        } else {
            console.log('Regular user detected - using topDown camera only');
            this.activeCamera = 'topDown';
            this.player.isAdmin = false;
        }
        
        console.log(`Camera mode set to: ${this.activeCamera}`);
    }
}