import * as THREE from 'three';

export class TopDownCamera {
    constructor(target, camera, options = {}) {
        this.target = target;           // Target to follow (your player)
        this.camera = camera;           // Three.js camera
        
        // Settings
        this.height = options.height || 15;
        this.angle = options.angle || 75;  // Degrees (90 is directly top-down)
        this.smoothTime = options.smoothTime || 0.1;
        this.horizontalLookAhead = options.horizontalLookAhead || 5;
        this.verticalLookAhead = options.verticalLookAhead || 5;
        this.angleFactor = options.angleFactor || 1;
        
        // Internal state
        this.currentVelocity = new THREE.Vector3();
        this.targetPosition = new THREE.Vector3();
        this.mousePosition = new THREE.Vector2(0, 0);
        
        // Set up mouse move listener that works with pointer lock
        document.addEventListener('mousemove', (event) => {
            // Only update if pointer is locked
            if (document.pointerLockElement) {
                // Use movement deltas instead of absolute position
                this.mousePosition.x = Math.max(-1, Math.min(1, this.mousePosition.x + event.movementX / 500));
                this.mousePosition.y = Math.max(-1, Math.min(1, this.mousePosition.y + event.movementY / 500));
            } else {
                // Reset when pointer lock is exited
                this.mousePosition.x = 0;
                this.mousePosition.y = 0;
            }
        });
    }
    
    update(deltaTime) {
        if (!this.target) return;
        
        // Get target position
        const playerPos = this.target.getPosition();
        
        // Calculate look-ahead based on mouse position
        const dx = this.mousePosition.x * this.horizontalLookAhead;
        const dz = this.mousePosition.y * this.verticalLookAhead;
        
        // Calculate z-offset based on camera angle using trigonometry
        const zRelativeToAngle = this.height / 
            Math.sin(this.angle * Math.PI / 180) * 
            Math.sin((90 - this.angle) * Math.PI / 180);
        
        // Set target position
        this.targetPosition.set(
            playerPos.x + dx,
            this.height,
            playerPos.z - zRelativeToAngle + dz
        );
        
        // Smoothly move camera towards target position
        this.camera.position.x += (this.targetPosition.x - this.camera.position.x) * this.smoothTime;
        this.camera.position.y += (this.targetPosition.y - this.camera.position.y) * this.smoothTime;
        this.camera.position.z += (this.targetPosition.z - this.camera.position.z) * this.smoothTime;
        
        // Calculate adjusted angle based on mouse position
        const adjustedAngle = this.angle - dz * this.angleFactor;
        
        // Set camera rotation
        this.camera.rotation.x = adjustedAngle * Math.PI / 180;
        this.camera.rotation.y = 0;
        this.camera.rotation.z = 0;
        
        // Make camera look at player
        this.camera.lookAt(
            new THREE.Vector3(
                playerPos.x + dx * 0.5,
                playerPos.y,
                playerPos.z + dz * 0.5
            )
        );
    }
}