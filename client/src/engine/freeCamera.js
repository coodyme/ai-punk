import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

export class FreeCamera {
    constructor(target, camera, renderer) {
        this.target = target;           // Target to follow (player)
        this.camera = camera;           // Three.js camera
        this.renderer = renderer;       // Three.js renderer
        
        // Create orbit controls for free camera movement
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.1;
        this.controls.rotateSpeed = 0.5;
        this.controls.zoomSpeed = 0.5;
        
        // Set initial camera position relative to player
        this.resetCameraPosition();
    }
    
    resetCameraPosition() {
        if (this.target) {
            const playerPos = this.target.getPosition();
            this.camera.position.set(
                playerPos.x, 
                playerPos.y + 10, 
                playerPos.z + 20
            );
            this.controls.target.copy(playerPos);
        }
    }
    
    update(deltaTime) {
        if (this.target) {
            // Keep the control target centered on the player
            const playerPos = this.target.getPosition();
            this.controls.target.set(playerPos.x, playerPos.y, playerPos.z);
        }
        
        // Update controls
        this.controls.update();
    }
    
    // Method to enable/disable this camera
    setEnabled(enabled) {
        this.controls.enabled = enabled;
    }
    
    // Clean up resources
    dispose() {
        this.controls.dispose();
    }
}