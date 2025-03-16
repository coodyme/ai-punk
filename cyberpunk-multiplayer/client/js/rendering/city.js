import * as THREE from 'three';

let scene, camera, renderer;

function initCity() {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    createCity();
    animate();
}

function createCity() {
    const cityGeometry = new THREE.BoxGeometry(1, 1, 1);
    const cityMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00 });

    for (let i = 0; i < 100; i++) {
        const cityBlock = new THREE.Mesh(cityGeometry, cityMaterial);
        cityBlock.position.x = Math.random() * 200 - 100;
        cityBlock.position.z = Math.random() * 200 - 100;
        cityBlock.position.y = Math.random() * 10 + 1;
        scene.add(cityBlock);
    }

    camera.position.z = 50;
}

function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}

export { initCity };