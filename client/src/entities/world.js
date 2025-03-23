import * as THREE from 'three';
import { ResourceManager } from '../utils/perfomance.js';
import { ModelLoader } from '../engine/loader.js';

export class WorldManager {
    constructor(scene, socket) {
        this.scene = scene;
        this.socket = socket;
        this.resourceManager = new ResourceManager(200); // 200 unit load distance
        this.modelLoader = new ModelLoader();
        
        // Store world items (pickable objects)
        this.worldItems = new Map();
        
        // Map to store building models
        this.buildings = new Map();
        
        // Initialize the world
        this.initialize();
    }
    
    initialize() {
        // Create ground
        this.createGround();
        
        // Create skybox/environment
        this.createSkybox();
        
        // Add initial buildings
        this.createBuildings();
        
        // Add ambient objects (non-interactive decorations)
        this.createAmbientObjects();
        
        // Add lighting for the world
        this.setupLighting();
        
        // Request world data from server
        this.socket.emit('world:request_data');
        
        // Setup socket event listeners for world updates
        this.setupSocketListeners();
    }
    
    createGround() {
        // Create simple ground plane
        const groundGeometry = new THREE.PlaneGeometry(1000, 1000);
        const groundMaterial = new THREE.MeshStandardMaterial({ 
            color: 0x222222,
            roughness: 0.8,
            metalness: 0.2
        });
        const ground = new THREE.Mesh(groundGeometry, groundMaterial);
        ground.rotation.x = -Math.PI / 2; // Rotate to be horizontal
        ground.receiveShadow = true;
        this.scene.add(ground);
    }
    
    createSkybox() {
        // Create a simple skybox using a color
        this.scene.background = new THREE.Color(0x050510);
        
        // In a more complete implementation, you might use:
        // - CubeTextureLoader with skybox textures
        // - Fog to create atmosphere
        this.scene.fog = new THREE.FogExp2(0x090916, 0.002);
    }
    
    createBuildings() {
        // Example building data - in a real game, this would come from the server
        const buildingData = [
            { id: 'building1', type: 'skyscraper', position: { x: 50, y: 0, z: 50 } },
            { id: 'building2', type: 'shop', position: { x: -30, y: 0, z: 70 } },
            { id: 'building3', type: 'apartment', position: { x: 80, y: 0, z: -40 } }
        ];
        
        // Create each building and add to the scene
        buildingData.forEach(data => {
            const building = this.createBuilding(data);
            this.buildings.set(data.id, building);
            
            // Add to resource manager for dynamic loading/unloading
            const position = new THREE.Vector3(data.position.x, data.position.y, data.position.z);
            this.resourceManager.addResource(data.id, building, position);
        });
    }
    
    createBuilding(data) {
        // Create a simple building based on type
        let building = new THREE.Group();
        const position = new THREE.Vector3(data.position.x, data.position.y, data.position.z);
        
        // Different types of buildings (simplified for this example)
        switch (data.type) {
            case 'skyscraper':
                const tower = new THREE.Mesh(
                    new THREE.BoxGeometry(20, 100, 20),
                    new THREE.MeshStandardMaterial({ color: 0x444444 })
                );
                tower.position.y = 50; // Half the height
                
                // Add neon lights
                const neonGeometry = new THREE.BoxGeometry(22, 2, 22);
                const neonMaterial = new THREE.MeshStandardMaterial({ 
                    color: 0x00ffff,
                    emissive: 0x00ffff,
                    emissiveIntensity: 1
                });
                
                for (let i = 0; i < 5; i++) {
                    const neon = new THREE.Mesh(neonGeometry, neonMaterial);
                    neon.position.y = i * 20 + 10;
                    building.add(neon);
                }
                
                building.add(tower);
                break;
                
            case 'shop':
                const shop = new THREE.Mesh(
                    new THREE.BoxGeometry(15, 8, 15),
                    new THREE.MeshStandardMaterial({ color: 0x666666 })
                );
                shop.position.y = 4;
                
                // Add neon sign
                const sign = new THREE.Mesh(
                    new THREE.BoxGeometry(10, 2, 1),
                    new THREE.MeshStandardMaterial({ 
                        color: 0xff00ff,
                        emissive: 0xff00ff,
                        emissiveIntensity: 1
                    })
                );
                sign.position.set(0, 9, 7.5);
                
                building.add(shop);
                building.add(sign);
                break;
                
            default:
                // Generic building
                const generic = new THREE.Mesh(
                    new THREE.BoxGeometry(15, 30, 15),
                    new THREE.MeshStandardMaterial({ color: 0x555555 })
                );
                generic.position.y = 15;
                building.add(generic);
        }
        
        // Position the building
        building.position.copy(position);
        building.castShadow = true;
        building.receiveShadow = true;
        
        this.scene.add(building);
        return building;
    }
    
    createAmbientObjects() {
        // Add decorative elements to the scene
        
        // Add some street lights
        const streetLights = [
            { x: 20, z: 20 },
            { x: -20, z: 20 },
            { x: 20, z: -20 },
            { x: -20, z: -20 }
        ];
        
        streetLights.forEach(pos => {
            const streetLight = this.createStreetLight();
            streetLight.position.set(pos.x, 0, pos.z);
            this.scene.add(streetLight);
        });
    }
    
    createStreetLight() {
        const group = new THREE.Group();
        
        // Pole
        const pole = new THREE.Mesh(
            new THREE.CylinderGeometry(0.5, 0.5, 15, 8),
            new THREE.MeshStandardMaterial({ color: 0x333333 })
        );
        pole.position.y = 7.5;
        
        // Light fixture
        const fixture = new THREE.Mesh(
            new THREE.BoxGeometry(3, 1, 3),
            new THREE.MeshStandardMaterial({ color: 0x222222 })
        );
        fixture.position.y = 15;
        
        // Light glow (emissive material)
        const glow = new THREE.Mesh(
            new THREE.BoxGeometry(2.5, 0.5, 2.5),
            new THREE.MeshStandardMaterial({ 
                color: 0x0088ff,
                emissive: 0x0088ff,
                emissiveIntensity: 1
            })
        );
        glow.position.y = 15;
        
        // Actual light source
        const light = new THREE.PointLight(0x0088ff, 1, 30);
        light.position.y = 15;
        
        group.add(pole);
        group.add(fixture);
        group.add(glow);
        group.add(light);
        
        return group;
    }
    
    setupLighting() {
        // Add ambient light for overall scene illumination
        const ambientLight = new THREE.AmbientLight(0x111111, 0.5);
        this.scene.add(ambientLight);
        
        // Main directional light (moon/sun)
        const directionalLight = new THREE.DirectionalLight(0x6666cc, 0.8);
        directionalLight.position.set(100, 100, 100);
        directionalLight.castShadow = true;
        
        // Configure shadow properties
        directionalLight.shadow.mapSize.width = 2048;
        directionalLight.shadow.mapSize.height = 2048;
        directionalLight.shadow.camera.near = 0.5;
        directionalLight.shadow.camera.far = 500;
        directionalLight.shadow.camera.left = -200;
        directionalLight.shadow.camera.right = 200;
        directionalLight.shadow.camera.top = 200;
        directionalLight.shadow.camera.bottom = -200;
        
        this.scene.add(directionalLight);
    }
    
    setupSocketListeners() {
        // Listen for world item additions from server
        this.socket.on('world:item:added', (data) => {
            this.addWorldItem(data);
        });
        
        // Listen for world item removals from server
        this.socket.on('world:item:removed', (data) => {
            this.removeWorldItem(data.worldItemId);
        });
        
        // Listen for world data from server
        this.socket.on('world:data', (data) => {
            if (data.items) {
                // Add all existing world items
                data.items.forEach(item => this.addWorldItem(item));
            }
        });
    }
    
    update(playerPosition) {
        // Update resource manager with player position
        this.resourceManager.updatePlayerPosition(playerPosition);
        
        // Update resource loading/unloading
        this.resourceManager.update(this.scene);
        
        // Animate world items (if needed)
        this.worldItems.forEach(item => {
            if (item.animate) {
                item.animate();
            }
        });
    }
    
    addWorldItem(data) {
        // Check if item already exists
        if (this.worldItems.has(data.worldItemId)) {
            return;
        }
        
        // Create a visual representation of the world item
        const item = this.createWorldItem(data);
        
        // Store the item
        this.worldItems.set(data.worldItemId, item);
        
        // Add to scene
        this.scene.add(item);
        
        // Add to resource manager for dynamic loading/unloading
        const position = new THREE.Vector3(data.position.x, data.position.y, data.position.z);
        this.resourceManager.addResource(`item-${data.worldItemId}`, item, position);
    }
    
    createWorldItem(data) {
        // Create a mesh based on item type
        const group = new THREE.Group();
        let mesh;
        
        switch (data.type) {
            case 'weapon':
                // Sword-like shape
                mesh = new THREE.Mesh(
                    new THREE.BoxGeometry(0.2, 0.8, 0.2),
                    new THREE.MeshStandardMaterial({ 
                        color: 0xaaaaaa,
                        metalness: 0.8,
                        roughness: 0.2
                    })
                );
                mesh.position.y = 0.4; // Half height above ground
                break;
                
            case 'consumable':
                // Potion-like shape
                mesh = new THREE.Mesh(
                    new THREE.CylinderGeometry(0.2, 0.2, 0.5, 8),
                    new THREE.MeshStandardMaterial({ 
                        color: 0x00ff88,
                        transparent: true,
                        opacity: 0.8
                    })
                );
                mesh.position.y = 0.25; // Half height above ground
                break;
                
            case 'currency':
                // Coin-like shape
                mesh = new THREE.Mesh(
                    new THREE.CylinderGeometry(0.3, 0.3, 0.05, 16),
                    new THREE.MeshStandardMaterial({ 
                        color: 0xffcc00,
                        metalness: 1,
                        roughness: 0.3
                    })
                );
                mesh.position.y = 0.025; // Half height above ground
                mesh.rotation.x = Math.PI / 2; // Make it flat
                break;
                
            default:
                // Generic item shape
                mesh = new THREE.Mesh(
                    new THREE.BoxGeometry(0.5, 0.5, 0.5),
                    new THREE.MeshStandardMaterial({ color: 0xffffff })
                );
                mesh.position.y = 0.25; // Half height above ground
        }
        
        // Add glow effect
        const glow = new THREE.PointLight(
            this.getItemColor(data.type),
            0.5,
            5
        );
        glow.position.y = 0.5;
        
        group.add(mesh);
        group.add(glow);
        
        // Position the item in the world
        group.position.set(
            data.position.x,
            data.position.y,
            data.position.z
        );
        
        // Add hover animation
        group.baseY = data.position.y;
        group.animate = () => {
            group.position.y = group.baseY + Math.sin(Date.now() * 0.003) * 0.2;
            group.rotation.y += 0.01;
        };
        
        return group;
    }
    
    removeWorldItem(worldItemId) {
        const item = this.worldItems.get(worldItemId);
        if (item) {
            // Remove from scene
            this.scene.remove(item);
            
            // Remove from collections
            this.worldItems.delete(worldItemId);
            this.resourceManager.resources.delete(`item-${worldItemId}`);
        }
    }
    
    getItemColor(type) {
        switch (type) {
            case 'weapon': return 0xff0000; // Red
            case 'consumable': return 0x00ff00; // Green
            case 'currency': return 0xffff00; // Yellow
            default: return 0xffffff; // White
        }
    }
}