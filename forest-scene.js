import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

// Scene setup
const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x88ccee, 0.015);

const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 200);
camera.position.set(0, 10, 30);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Lighting
const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, 1.0);
scene.add(hemiLight);

const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
dirLight.position.set(10, 20, 10);
scene.add(dirLight);

// Ground
const groundGeo = new THREE.PlaneGeometry(200, 200);
const groundMat = new THREE.MeshStandardMaterial({ color: 0x337a1f });
const ground = new THREE.Mesh(groundGeo, groundMat);
ground.rotation.x = -Math.PI / 2;
ground.receiveShadow = true;
scene.add(ground);

// Simple procedural tree function (replace with imported model for realism)
function createTree() {
    const tree = new THREE.Group();

    // Trunk
    const trunkGeo = new THREE.CylinderGeometry(0.2, 0.3, 3, 8);
    const trunkMat = new THREE.MeshPhysicalMaterial({
        color: 0x8b5a2b,
        roughness: 0.9,
        metalness: 0.1
    });
    const trunk = new THREE.Mesh(trunkGeo, trunkMat);
    trunk.position.y = 1.5;
    tree.add(trunk);

    // Leaves (sphere, can be replaced with more complex geometry or textures)
    const leavesGeo = new THREE.SphereGeometry(1.5, 16, 16);
    const leavesMat = new THREE.MeshPhysicalMaterial({
        color: 0x2e8b57,
        roughness: 0.7,
        metalness: 0.05,
        clearcoat: 0.25,
        transparent: true,
        opacity: 0.95
    });
    const leaves = new THREE.Mesh(leavesGeo, leavesMat);
    leaves.position.y = 3.5;
    tree.add(leaves);

    return tree;
}

// Scatter trees
const numTrees = 100;
for (let i = 0; i < numTrees; i++) {
    const tree = createTree();
    const angle = Math.random() * Math.PI * 2;
    const radius = 40 + Math.random() * 60;
    tree.position.set(
        Math.cos(angle) * radius + (Math.random() - 0.5) * 10,
        0,
        Math.sin(angle) * radius + (Math.random() - 0.5) * 10
    );
    tree.rotation.y = Math.random() * Math.PI * 2;
    const scale = 0.8 + Math.random() * 0.7;
    tree.scale.set(scale, scale + Math.random() * 0.3, scale);
    scene.add(tree);
}

// Controls
const controls = new OrbitControls(camera, renderer.domElement);

// Render loop
function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}
animate();

// Handle resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});