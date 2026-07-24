import * as THREE from 'three';
import { PlasticMaterialFactory } from './materials/PlasticMaterialFactory';
import { buildLanternString, buildLaundryLine, buildWell } from './world/StreetProps';
import { buildCrowd } from './world/Crowd';

const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
renderer.setPixelRatio(1); renderer.setSize(innerWidth, innerHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace; renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.15; renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.body.appendChild(renderer.domElement);

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x1a2338);
scene.fog = new THREE.Fog(0x1a2338, 30, 90);
const plastic = new PlasticMaterialFactory();

const floor = new THREE.Mesh(new THREE.CircleGeometry(40, 48), new THREE.MeshStandardMaterial({ color: 0x4a453e, roughness: 0.95 }));
floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; scene.add(floor);

scene.add(new THREE.HemisphereLight(0x5a6a86, 0x1a1c22, 1.0));
const moon = new THREE.DirectionalLight(0xcfe0ff, 1.6); moon.position.set(-10, 20, 8); moon.castShadow = true;
moon.shadow.mapSize.set(1024, 1024); moon.shadow.camera.left = -20; moon.shadow.camera.right = 20; moon.shadow.camera.top = 20; moon.shadow.camera.bottom = -10;
scene.add(moon);

// Dos "casas" simples para colgar la ropa y los farolillos
function house(x: number, z: number, color: number): void {
  const w = new THREE.Mesh(new THREE.BoxGeometry(6, 6, 6), plastic.get(color));
  w.position.set(x, 3, z); w.castShadow = true; w.receiveShadow = true; scene.add(w);
}
house(-9, -2, 0xb9a36f); house(9, -2, 0xc9b083);

// Farolillos cruzando + ropa tendida + pozo
scene.add(buildLanternString(plastic, { ax: -8, az: 0, bx: 8, bz: 0, height: 6.2, count: 7, lights: 3 }));
scene.add(buildLaundryLine(plastic, { ax: -9, az: 2, bx: -3, bz: 5, height: 5, count: 4, seed: 1 }));
scene.add(buildLaundryLine(plastic, { ax: 9, az: 2, bx: 3, bz: 5, height: 5, count: 4, seed: 3 }));
scene.add(buildWell(plastic, { x: 0, z: 6 }));

const crowd = buildCrowd(scene, plastic, [
  { x: -2.4, z: 6.6, yaw: 0.7, emotion: 'happy' },
  { x: 2.4, z: 6.6, yaw: -0.7, emotion: 'neutral' },
  { x: 0.4, z: 8.4, yaw: Math.PI, emotion: 'surprised', scale: 0.66 }
]);

const camera = new THREE.PerspectiveCamera(48, innerWidth / innerHeight, 0.1, 200);
camera.position.set(0, 6, 17); camera.lookAt(0, 3.2, 0);

let t = 0;
function loop(): void { requestAnimationFrame(loop); t += 0.016; crowd.update(0.016); renderer.render(scene, camera); (window as any).__ready = true; }
loop();
addEventListener('resize', () => { renderer.setSize(innerWidth, innerHeight); camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix(); });
