import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { GlitchPass } from 'three/examples/jsm/postprocessing/GlitchPass.js';
import { RGBShiftShader } from 'three/examples/jsm/shaders/RGBShiftShader.js';

/**
 * Handles rendering of the 3D scene with cyberpunk post-processing effects
 */
export class Renderer {
    /**
     * Create a new renderer instance
     * @param {Object} options - Configuration options
     * @param {HTMLElement} options.container - Container element for the renderer
     * @param {THREE.Scene} options.scene - Three.js scene to render
     * @param {THREE.Camera} options.camera - Camera for rendering viewpoint
     * @param {boolean} options.shadows - Whether to enable shadows
     * @param {boolean} options.postprocessing - Whether to enable post-processing
     */
    constructor(options) {
        this.scene = options.scene;
        this.camera = options.camera;
        this.container = options.container || document.body;
        
        this.width = window.innerWidth;
        this.height = window.innerHeight;
        
        // Create renderer
        this.renderer = new THREE.WebGLRenderer({
            antialias: true,
            alpha: false,
            powerPreference: 'high-performance'
        });
        
        this.renderer.setSize(this.width, this.height);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // Limit pixel ratio for performance
        
        // Configure renderer
        this.renderer.outputColorSpace = THREE.SRGBColorSpace;
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.2;
        
        // Enable shadows if requested
        if (options.shadows !== false) {
            this.renderer.shadowMap.enabled = true;
            this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        }
        
        // Append to DOM
        this.container.appendChild(this.renderer.domElement);
        
        // Post-processing setup
        this.composer = null;
        if (options.postprocessing !== false) {
            this.setupPostProcessing();
        }
        
        // Auto resize
        window.addEventListener('resize', () => this.onResize());
        
        // Debugging flags
        this.debugMode = false;
        
        // Stats for performance monitoring
        this.stats = null;
        
        // Performance mode
        this.performanceMode = false;
    }
    
    /**
     * Set up post-processing effects
     */
    setupPostProcessing() {
        // Create composer
        this.composer = new EffectComposer(this.renderer);
        
        // Standard render pass
        const renderPass = new RenderPass(this.scene, this.camera);
        this.composer.addPass(renderPass);
        
        // Bloom effect for neon lights
        const bloomPass = new UnrealBloomPass(
            new THREE.Vector2(this.width, this.height),
            0.8,    // strength
            0.3,    // radius
            0.9     // threshold
        );
        this.composer.addPass(bloomPass);
        
        // RGB shift effect for cyberpunk feel
        const rgbShiftPass = new ShaderPass(RGBShiftShader);
        rgbShiftPass.uniforms.amount.value = 0.0015;
        this.composer.addPass(rgbShiftPass);
        
        // Intermittent glitch effect (disabled by default)
        this.glitchPass = new GlitchPass();
        this.glitchPass.enabled = false;
        this.composer.addPass(this.glitchPass);
        
        // Store passes for later adjustment
        this.passes = {
            bloom: bloomPass,
            rgbShift: rgbShiftPass,
            glitch: this.glitchPass
        };
    }
    
    /**
     * Handle window resize
     */
    onResize() {
        this.width = window.innerWidth;
        this.height = window.innerHeight;
        
        // Update camera
        if (this.camera) {
            this.camera.aspect = this.width / this.height;
            this.camera.updateProjectionMatrix();
        }
        
        // Update renderer
        this.renderer.setSize(this.width, this.height);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        
        // Update composer
        if (this.composer) {
            this.composer.setSize(this.width, this.height);
        }
    }
    
    /**
     * Render the scene
     */
    render() {
        if (this.composer && !this.performanceMode) {
            this.composer.render();
        } else {
            this.renderer.render(this.scene, this.camera);
        }
        
        if (this.stats) {
            this.stats.update();
        }
    }
    
    /**
     * Toggle performance mode (disables post-processing)
     * @param {boolean} enabled - Whether to enable performance mode
     */
    setPerformanceMode(enabled) {
        this.performanceMode = enabled;
    }
    
    /**
     * Enable combat/damage effect
     * @param {number} duration - Duration of effect in milliseconds
     */
    enableCombatEffect(duration = 500) {
        if (!this.passes) return;
        
        // Enable glitch effect
        this.passes.glitch.enabled = true;
        
        // Increase RGB shift
        const originalRgbShiftAmount = this.passes.rgbShift.uniforms.amount.value;
        this.passes.rgbShift.uniforms.amount.value = 0.006;
        
        // Reset after duration
        setTimeout(() => {
            this.passes.glitch.enabled = false;
            this.passes.rgbShift.uniforms.amount.value = originalRgbShiftAmount;
        }, duration);
    }
    
    /**
     * Add rain effect to the scene
     */
    addRainEffect() {
        const rainCount = 5000;
        const rainGeometry = new THREE.BufferGeometry();
        const rainPositions = new Float32Array(rainCount * 3);
        const rainVelocities = new Float32Array(rainCount);
        
        for (let i = 0; i < rainCount; i++) {
            const i3 = i * 3;
            rainPositions[i3] = (Math.random() * 400) - 200;
            rainPositions[i3 + 1] = (Math.random() * 500) - 50;
            rainPositions[i3 + 2] = (Math.random() * 400) - 200;
            rainVelocities[i] = Math.random() * 0.1 + 0.1;
        }
        
        rainGeometry.setAttribute('position', new THREE.BufferAttribute(rainPositions, 3));
        rainGeometry.setAttribute('velocity', new THREE.BufferAttribute(rainVelocities, 1));
        
        const rainMaterial = new THREE.PointsMaterial({
            color: 0x00aaff,
            size: 0.1,
            transparent: true,
            opacity: 0.6,
            fog: true
        });
        
        this.rain = new THREE.Points(rainGeometry, rainMaterial);
        this.scene.add(this.rain);
    }
    
    /**
     * Update rain animation
     */
    updateRain() {
        if (!this.rain) return;
        
        const positions = this.rain.geometry.attributes.position.array;
        const velocities = this.rain.geometry.attributes.velocity.array;
        const count = positions.length / 3;
        
        for (let i = 0; i < count; i++) {
            const i3 = i * 3;
            positions[i3 + 1] -= velocities[i];
            
            // If rain drop has gone below the ground, reset it to the top
            if (positions[i3 + 1] < -50) {
                positions[i3 + 1] = 200;
            }
        }
        
        this.rain.geometry.attributes.position.needsUpdate = true;
    }
    
    /**
     * Toggle debug mode
     * @param {boolean} enabled - Whether to enable debug mode
     */
    setDebugMode(enabled) {
        this.debugMode = enabled;
        
        if (enabled) {
            // Add axis helper
            if (!this.axisHelper) {
                this.axisHelper = new THREE.AxesHelper(5);
                this.scene.add(this.axisHelper);
            }
            
            // Add stats
            if (!this.stats) {
                import('three/examples/jsm/libs/stats.module.js').then((Stats) => {
                    this.stats = new Stats.default();
                    this.stats.dom.style.position = 'absolute';
                    this.stats.dom.style.left = '0px';
                    this.stats.dom.style.top = '0px';
                    document.body.appendChild(this.stats.dom);
                });
            }
        } else {
            // Remove axis helper
            if (this.axisHelper) {
                this.scene.remove(this.axisHelper);
                this.axisHelper = null;
            }
            
            // Remove stats
            if (this.stats) {
                document.body.removeChild(this.stats.dom);
                this.stats = null;
            }
        }
    }
    
    /**
     * Dispose renderer resources to prevent memory leaks
     */
    dispose() {
        // Remove event listeners
        window.removeEventListener('resize', this.onResize);
        
        // Dispose Three.js resources
        this.renderer.dispose();
        
        // Remove DOM elements
        if (this.renderer.domElement && this.renderer.domElement.parentNode) {
            this.renderer.domElement.parentNode.removeChild(this.renderer.domElement);
        }
        
        // Dispose stats if present
        if (this.stats && this.stats.dom && this.stats.dom.parentNode) {
            this.stats.dom.parentNode.removeChild(this.stats.dom);
        }
    }
}