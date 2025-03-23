import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';

export class ModelLoader {
    constructor() {
        this.gltfLoader = new GLTFLoader();
        this.fbxLoader = new FBXLoader();
        this.textureLoader = new THREE.TextureLoader();
        
        // Cache for loaded models and textures
        this.modelCache = new Map();
        this.textureCache = new Map();
        
        // Loading manager for tracking load progress
        this.loadingManager = new THREE.LoadingManager();
        this.setupLoadingManager();
    }
    
    setupLoadingManager() {
        this.loadingManager.onStart = (url, itemsLoaded, itemsTotal) => {
            console.log(`Started loading: ${url} (${itemsLoaded}/${itemsTotal})`);
            this.showLoadingUI(true);
        };
        
        this.loadingManager.onLoad = () => {
            console.log('Loading complete!');
            this.showLoadingUI(false);
        };
        
        this.loadingManager.onProgress = (url, itemsLoaded, itemsTotal) => {
            console.log(`Loading file: ${url} (${itemsLoaded}/${itemsTotal})`);
            const progress = itemsLoaded / itemsTotal;
            this.updateLoadingProgress(progress);
        };
        
        this.loadingManager.onError = (url) => {
            console.error(`Error loading: ${url}`);
        };
        
        // Set loading manager for all loaders
        this.gltfLoader.manager = this.loadingManager;
        this.fbxLoader.manager = this.loadingManager;
        this.textureLoader.manager = this.loadingManager;
    }
    
    showLoadingUI(visible) {
        let loadingUI = document.getElementById('loading-ui');
        
        if (!loadingUI && visible) {
            loadingUI = document.createElement('div');
            loadingUI.id = 'loading-ui';
            loadingUI.style.position = 'fixed';
            loadingUI.style.top = '0';
            loadingUI.style.left = '0';
            loadingUI.style.width = '100%';
            loadingUI.style.height = '100%';
            loadingUI.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
            loadingUI.style.display = 'flex';
            loadingUI.style.flexDirection = 'column';
            loadingUI.style.justifyContent = 'center';
            loadingUI.style.alignItems = 'center';
            loadingUI.style.zIndex = '1000';
            
            const loadingText = document.createElement('div');
            loadingText.textContent = 'Loading...';
            loadingText.style.color = '#0ff';
            loadingText.style.fontSize = '24px';
            loadingText.style.marginBottom = '20px';
            
            const progressContainer = document.createElement('div');
            progressContainer.style.width = '300px';
            progressContainer.style.height = '20px';
            progressContainer.style.backgroundColor = '#222';
            progressContainer.style.border = '1px solid #0ff';
            
            const progressBar = document.createElement('div');
            progressBar.id = 'loading-progress';
            progressBar.style.width = '0%';
            progressBar.style.height = '100%';
            progressBar.style.backgroundColor = '#0ff';
            
            progressContainer.appendChild(progressBar);
            loadingUI.appendChild(loadingText);
            loadingUI.appendChild(progressContainer);
            
            document.body.appendChild(loadingUI);
        } else if (loadingUI && !visible) {
            document.body.removeChild(loadingUI);
        }
    }
    
    updateLoadingProgress(progress) {
        const progressBar = document.getElementById('loading-progress');
        if (progressBar) {
            progressBar.style.width = `${progress * 100}%`;
        }
    }
    
    loadModel(modelPath, type = 'gltf') {
        // Check cache first
        if (this.modelCache.has(modelPath)) {
            return Promise.resolve(this.modelCache.get(modelPath).clone());
        }
        
        // Load based on type
        return new Promise((resolve, reject) => {
            if (type === 'gltf') {
                this.gltfLoader.load(
                    modelPath,
                    (gltf) => {
                        const model = gltf.scene;
                        // Process model (like attaching animations, shadows, etc)
                        this.processModel(model);
                        // Cache model clone
                        this.modelCache.set(modelPath, model.clone());
                        resolve(model);
                    },
                    undefined,
                    (error) => {
                        console.error(`Error loading model ${modelPath}:`, error);
                        reject(error);
                    }
                );
            } else if (type === 'fbx') {
                this.fbxLoader.load(
                    modelPath,
                    (fbx) => {
                        this.processModel(fbx);
                        this.modelCache.set(modelPath, fbx.clone());
                        resolve(fbx);
                    },
                    undefined,
                    (error) => {
                        console.error(`Error loading model ${modelPath}:`, error);
                        reject(error);
                    }
                );
            } else {
                reject(new Error(`Unsupported model type: ${type}`));
            }
        });
    }
    
    loadTexture(texturePath) {
        // Check cache first
        if (this.textureCache.has(texturePath)) {
            return Promise.resolve(this.textureCache.get(texturePath));
        }
        
        return new Promise((resolve, reject) => {
            this.textureLoader.load(
                texturePath,
                (texture) => {
                    // Optimize texture
                    texture.flipY = false;
                    texture.encoding = THREE.SRGBColorSpace;
                    
                    // Cache texture
                    this.textureCache.set(texturePath, texture);
                    resolve(texture);
                },
                undefined,
                (error) => {
                    console.error(`Error loading texture ${texturePath}:`, error);
                    reject(error);
                }
            );
        });
    }
    
    processModel(model) {
        // Enable shadows for all meshes
        model.traverse((child) => {
            if (child.isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;
                
                // Optimize materials
                if (child.material) {
                    child.material.needsUpdate = true;
                }
            }
        });
        
        return model;
    }
    
    // Helper to load character models with animations
    async loadCharacterModel(modelPath, animationsPath) {
        const model = await this.loadModel(modelPath);
        
        if (animationsPath) {
            try {
                const animations = await this.loadAnimations(animationsPath);
                model.animations = animations;
            } catch (error) {
                console.error('Failed to load animations:', error);
            }
        }
        
        return model;
    }
    
    async loadAnimations(animationsPath) {
        return new Promise((resolve, reject) => {
            this.fbxLoader.load(
                animationsPath,
                (fbx) => {
                    resolve(fbx.animations);
                },
                undefined,
                (error) => {
                    console.error(`Error loading animations ${animationsPath}:`, error);
                    reject(error);
                }
            );
        });
    }
    
    // Helper to create a material with a texture
    async createMaterialWithTexture(texturePath, options = {}) {
        const texture = await this.loadTexture(texturePath);
        
        const materialOptions = {
            map: texture,
            ...options
        };
        
        return new THREE.MeshStandardMaterial(materialOptions);
    }
}