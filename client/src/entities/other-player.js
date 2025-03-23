import * as THREE from 'three';

/**
 * Resource manager for dynamic loading/unloading of resources
 */
export class ResourceManager {
    constructor(loadDistance = 200) {
        this.resources = new Map();
        this.loadDistance = loadDistance;
        this.playerPosition = null;
    }
    
    addResource(id, object, position) {
        this.resources.set(id, {
            object,
            position,
            loaded: true
        });
    }
    
    updatePlayerPosition(position) {
        this.playerPosition = position;
    }
    
    update(scene) {
        if (!this.playerPosition) return;
        
        this.resources.forEach((resource, id) => {
            const distance = resource.position.distanceTo(this.playerPosition);
            
            // If resource is too far and currently loaded, unload it
            if (distance > this.loadDistance && resource.loaded) {
                scene.remove(resource.object);
                resource.loaded = false;
            }
            // If resource is within range and not loaded, load it
            else if (distance <= this.loadDistance && !resource.loaded) {
                scene.add(resource.object);
                resource.loaded = true;
            }
        });
    }
}

/**
 * Optimize texture for performance
 * @param {THREE.Texture} texture - The texture to optimize
 */
export function optimizeTexture(texture) {
    texture.minFilter = THREE.LinearFilter;
    texture.generateMipmaps = false;
    return texture;
}

/**
 * Class representing another player in the game
 */
export default class OtherPlayer {
    constructor(scene, playerData) {
        this.id = playerData.id;
        this.username = playerData.username;
        this.position = new THREE.Vector3(
            playerData.position.x || 0,
            playerData.position.y || 0,
            playerData.position.z || 0
        );
        this.rotation = playerData.position.rotation || 0;
        this.targetPosition = this.position.clone();
        this.targetRotation = this.rotation;
        this.interpolationFactor = 0.1; // Control the smoothness of movement
        
        // Create player model
        this.createPlayerModel(scene);
    }
    
    createPlayerModel(scene) {
        // Create a group to hold all player meshes
        this.model = new THREE.Group();
        
        // Body
        const bodyGeometry = new THREE.CylinderGeometry(0.5, 0.5, 1.8, 8);
        const bodyMaterial = new THREE.MeshStandardMaterial({ color: 0xff5500 });
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
        const indicatorMaterial = new THREE.MeshStandardMaterial({ color: 0x0000ff });
        const indicator = new THREE.Mesh(indicatorGeometry, indicatorMaterial);
        indicator.position.z = 0.65;
        indicator.position.y = 1.5;
        this.model.add(indicator);
        
        // Add username text above player
        if (this.username) {
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            canvas.width = 256;
            canvas.height = 64;
            
            context.font = 'Bold 24px Arial';
            context.fillStyle = 'white';
            context.textAlign = 'center';
            context.fillText(this.username, 128, 24);
            
            const texture = new THREE.CanvasTexture(canvas);
            const spriteMaterial = new THREE.SpriteMaterial({ 
                map: texture,
                transparent: true
            });
            
            const sprite = new THREE.Sprite(spriteMaterial);
            sprite.position.y = 2.5;
            sprite.scale.set(2, 0.5, 1);
            
            this.model.add(sprite);
        }
        
        // Add to scene at starting position
        this.model.position.copy(this.position);
        this.model.rotation.y = this.rotation;
        scene.add(this.model);
    }
    
    update() {
        // Smoothly interpolate position and rotation
        this.position.lerp(this.targetPosition, this.interpolationFactor);
        this.rotation += (this.targetRotation - this.rotation) * this.interpolationFactor;
        
        // Update model position and rotation
        this.model.position.copy(this.position);
        this.model.rotation.y = this.rotation;
    }
    
    setTargetPosition(position) {
        if (position) {
            this.targetPosition.set(
                position.x || this.targetPosition.x,
                position.y || this.targetPosition.y,
                position.z || this.targetPosition.z
            );
            this.targetRotation = position.rotation || this.targetRotation;
        }
    }
    
    remove(scene) {
        scene.remove(this.model);
    }
}