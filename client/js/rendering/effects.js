const createEffect = (scene, camera) => {
    const effect = new THREE.FogExp2(0x000000, 0.1);
    scene.fog = effect;
};

const addPostProcessing = (renderer, scene, camera) => {
    const composer = new THREE.EffectComposer(renderer);
    const renderPass = new THREE.RenderPass(scene, camera);
    composer.addPass(renderPass);

    const bloomPass = new THREE.BloomPass(1.5);
    composer.addPass(bloomPass);

    return composer;
};

const renderEffects = (composer) => {
    composer.render();
};

export { createEffect, addPostProcessing, renderEffects };