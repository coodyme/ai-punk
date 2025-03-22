import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

const models = {
    player: null,
    enemy: null,
    sword: null,
};

const loadModels = (scene) => {
    const loader = new GLTFLoader();

    loader.load('/assets/models/player.glb', (gltf) => {
        models.player = gltf.scene;
        scene.add(models.player);
    });

    loader.load('/assets/models/enemy.glb', (gltf) => {
        models.enemy = gltf.scene;
        scene.add(models.enemy);
    });

    loader.load('/assets/models/sword.glb', (gltf) => {
        models.sword = gltf.scene;
        scene.add(models.sword);
    });
};

export { models, loadModels };