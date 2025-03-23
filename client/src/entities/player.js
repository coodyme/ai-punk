import * as THREE from 'three';

// Define role constants on client side as well
export const ROLES = {
    ADMIN: 0,
    PLAYER: 1
};

export class Player {
    constructor(scene, camera) {
        this.id = null;
        this.username = null;
        this.position = new THREE.Vector3(0, 0, 0);
        this.rotation = 0;
        this.moveSpeed = 0.15;
        this.rotationSpeed = 0.05;
        this.lastUpdateTime = 0;
        this.updateInterval = 100; // ms
        this.isAdmin = false; // Initialize admin status
        
        // Create player model
        this.createPlayerModel(scene);
    }
    
    createPlayerModel(scene) {
        // Create simple player model for now
        // In a real game, you'd load an actual model
        
        // Create a group to hold all player meshes
        this.model = new THREE.Group();
        
        // Body
        const bodyGeometry = new THREE.CylinderGeometry(0.5, 0.5, 1.8, 8);
        const bodyMaterial = new THREE.MeshStandardMaterial({ color: 0x00ffff });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.position.y = 0.9;
        body.castShadow = true;
        this.model.add(body);
        
        // Head
        const headGeometry = new THREE.SphereGeometry(0.4, 16, 16);
        const headMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff });
        const head = new THREE.Mesh(headGeometry, headMaterial);
        head.position.y = 2.0;
        head.castShadow = true;
        this.model.add(head);
        
        // Add directional indicator (front)
        const indicatorGeometry = new THREE.BoxGeometry(0.2, 0.2, 0.6);
        const indicatorMaterial = new THREE.MeshStandardMaterial({ color: 0xff0000 });
        const indicator = new THREE.Mesh(indicatorGeometry, indicatorMaterial);
        indicator.position.z = 0.65;
        indicator.position.y = 1.5;
        this.model.add(indicator);
        
        // Add to scene at starting position
        this.model.position.copy(this.position);
        scene.add(this.model);
    }
    
    update(input) {
        // Update position based on input
        if (input) {
            // Move forward/backward
            if (input.forward) {
                this.position.x += Math.sin(this.rotation) * this.moveSpeed;
                this.position.z += Math.cos(this.rotation) * this.moveSpeed;
            } else if (input.backward) {
                this.position.x -= Math.sin(this.rotation) * this.moveSpeed;
                this.position.z -= Math.cos(this.rotation) * this.moveSpeed;
            }
            
            // Rotate left/right
            if (input.left) {
                this.rotation -= this.rotationSpeed;
            } else if (input.right) {
                this.rotation += this.rotationSpeed;
            }
        }
        
        // Update model position and rotation
        this.model.position.copy(this.position);
        this.model.rotation.y = this.rotation;
    }
    
    shouldUpdateServer() {
        const now = Date.now();
        if (now - this.lastUpdateTime > this.updateInterval) {
            this.lastUpdateTime = now;
            return true;
        }
        return false;
    }
    
    getPosition() {
        return this.position.clone();
    }
    
    getPositionUpdate() {
        return {
            x: this.position.x,
            y: this.position.y,
            z: this.position.z,
            rotation: this.rotation
        };
    }
    
    setPlayerData(data) {
        this.id = data.id;
        this.username = data.username;
        
        if (data.position) {
            this.position.set(
                data.position.x || 0,
                data.position.y || 0,
                data.position.z || 0
            );
            this.rotation = data.position.rotation || 0;
        }
        
        // Ensure role is stored as a number
        this.role = parseInt(data.role);
        
        // Compute isAdmin based on numeric role
        this.isAdmin = this.role === ROLES.ADMIN;
        
        console.log(`Player ${this.username} - Role: ${this.role} (${typeof this.role}), isAdmin: ${this.isAdmin}`);
    }
    
    // Add a helper method to check if player is admin
    isAdminUser() {
        return this.role === ROLES.ADMIN;
    }
}