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