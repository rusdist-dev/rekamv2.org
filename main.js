import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

// Basic scene setup
const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x88ccee, 0.018);

const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 400);
camera.position.set(0, 12, 38);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
document.body.appendChild(renderer.domElement);

// Lighting
const hemiLight = new THREE.HemisphereLight(0xffffff, 0x666666, 1.2);
scene.add(hemiLight);

const dirLight = new THREE.DirectionalLight(0xffffff, 0.7);
dirLight.position.set(25, 45, 35);
dirLight.castShadow = true;
dirLight.shadow.mapSize.set(2048, 2048);
scene.add(dirLight);

// Ground
const groundGeo = new THREE.PlaneGeometry(500, 500);
const groundMat = new THREE.MeshStandardMaterial({ color: 0x4a7d39 });
const ground = new THREE.Mesh(groundGeo, groundMat);
ground.rotation.x = -Math.PI / 2;
ground.receiveShadow = true;
scene.add(ground);

// Controls
const controls = new OrbitControls(camera, renderer.domElement);

// Load a realistic tree model
const loader = new GLTFLoader();
const treeModelUrl = 'models/tree.glb'; // Place your tree model here

loader.load(treeModelUrl, (gltf) => {
    const tree = gltf.scene;
    tree.traverse((child) => {
        if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
        }
    });

    // Scatter trees in the forest
    const treeCount = 100;
    for (let i = 0; i < treeCount; i++) {
        const instance = tree.clone();
        const angle = Math.random() * Math.PI * 2;
        const radius = 18 + Math.random() * 70;
        instance.position.set(
            Math.cos(angle) * radius + (Math.random() - 0.5) * 7,
            0,
            Math.sin(angle) * radius + (Math.random() - 0.5) * 7
        );
        instance.rotation.y = Math.random() * Math.PI * 2;
        const scale = 0.8 + Math.random() * 1.2;
        instance.scale.set(scale, scale, scale);
        scene.add(instance);
    }
}, undefined, (error) => {
    console.error('An error occurred loading the model:', error);
});

// Animate loop
function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}
animate();

// Responsive resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});