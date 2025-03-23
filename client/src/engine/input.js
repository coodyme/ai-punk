export class InputHandler {
    constructor(player, socket) {
        this.player = player;
        this.socket = socket;
        
        this.keys = {
            forward: false,
            backward: false,
            left: false,
            right: false,
            run: false,
            jump: false
        };
        
        // Mouse control variables
        this.mouseEnabled = true;
        this.mouseSensitivity = 0.002;
        this.previousMousePosition = {
            x: 0,
            y: 0
        };
        
        // Setup event listeners
        this.setupKeyboardEvents();
        this.setupMouseEvents();
        
        // Lock mouse pointer for camera control
        this.pointerLocked = false;
    }
    
    setupKeyboardEvents() {
        window.addEventListener('keydown', (event) => {
            switch (event.key.toLowerCase()) {
                case 'w':
                    this.keys.forward = true;
                    break;
                case 's':
                    this.keys.backward = true;
                    break;
                case 'a':
                    this.keys.left = true;
                    break;
                case 'd':
                    this.keys.right = true;
                    break;
                case 'shift':
                    this.keys.run = true;
                    break;
                case ' ':
                    this.keys.jump = true;
                    this.handleJump();
                    break;
            }
        });
        
        window.addEventListener('keyup', (event) => {
            switch (event.key.toLowerCase()) {
                case 'w':
                    this.keys.forward = false;
                    break;
                case 's':
                    this.keys.backward = false;
                    break;
                case 'a':
                    this.keys.left = false;
                    break;
                case 'd':
                    this.keys.right = false;
                    break;
                case 'shift':
                    this.keys.run = false;
                    break;
                case ' ':
                    this.keys.jump = false;
                    break;
            }
        });
    }
    
    setupMouseEvents() {
        // Add mousemove event listener for camera rotation
        document.addEventListener('mousemove', (event) => {
            if (this.mouseEnabled && this.pointerLocked) {
                // Calculate mouse movement
                const movementX = event.movementX || 
                    event.mozMovementX || 
                    event.webkitMovementX || 0;
                
                // Update player rotation based on mouse movement
                if (movementX) {
                    this.player.rotation += movementX * this.mouseSensitivity;
                }
            }
        });
        
        // Add pointer lock functionality
        document.addEventListener('click', (event) => {
            // Only try to lock if not already locked
            if (!document.pointerLockElement) {
                this.lockPointer();
            }
        });
        
        // Handle pointer lock change
        document.addEventListener('pointerlockchange', () => {
            this.pointerLocked = document.pointerLockElement !== null;
        });
        
        // Handle pointer lock error
        document.addEventListener('pointerlockerror', (event) => {
            console.error('Pointer lock failed:', event);
        });
        
        // Modify the attack click handler to prevent conflict with OrbitControls
        window.addEventListener('click', (event) => {
            // Only process click attacks when pointer is locked
            if (this.pointerLocked && this.player && this.player.inventory) {
                try {
                    // Get the equipped weapon (if any)
                    const equipIndex = this.findEquippedWeaponIndex();
                    
                    if (equipIndex >= 0) {
                        // Get a point in front of the player for the attack
                        const position = this.player.getPosition();
                        const rotation = this.player.rotation;
                        
                        const targetPosition = {
                            x: position.x + Math.sin(rotation) * 2,
                            y: position.y,
                            z: position.z + Math.cos(rotation) * 2
                        };
                        
                        this.socket.emit('player:attack', {
                            weaponId: this.player.inventory[equipIndex].id,
                            position: targetPosition,
                            targetId: null
                        });
                    }
                } catch (error) {
                    console.error('Error processing attack:', error);
                }
            }
        });
    }
    
    lockPointer() {
        const gameCanvas = document.querySelector('canvas');
        if (gameCanvas) {
            try {
                // Request pointer lock with better error handling
                gameCanvas.requestPointerLock = 
                    gameCanvas.requestPointerLock || 
                    gameCanvas.mozRequestPointerLock || 
                    gameCanvas.webkitRequestPointerLock;
                
                // Make sure OrbitControls can't interfere during this operation
                if (window.game && window.game.freeCamera) {
                    window.game.freeCamera.setEnabled(false);
                }
                
                gameCanvas.requestPointerLock();
            } catch (error) {
                console.error('Error requesting pointer lock:', error);
            }
        } else {
            console.warn('Canvas element not found for pointer lock');
        }
    }
    
    handleJump() {
        // Emit jump event
        this.socket.emit('player:jump', {
            position: this.player.getPosition()
        });
    }
    
    getMovementInput() {
        return { ...this.keys };
    }
    
    findEquippedWeaponIndex() {
        if (!this.player.inventory) return -1;
        
        return this.player.inventory.findIndex(item => 
            item.type === 'weapon' && item.equipped
        );
    }
}