import * as THREE from 'three';
import { PlasticMaterialFactory } from './materials/PlasticMaterialFactory';
import { createMinifigure, YOSHUA_SKIN, PRIEST_SKIN } from './characters/MinifigureFactory';
import { buildPartedRiver } from './world/PartedRiver';
import { buildHorizon } from './world/Horizon';
import { buildCrowd } from './world/Crowd';
import { buildRiverbank } from './world/Riverbank';

const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
renderer.setPixelRatio(1); renderer.setSize(innerWidth, innerHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace; renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.25; renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.body.appendChild(renderer.domElement);

const scene = new THREE.Scene();
const plastic = new PlasticMaterialFactory();

// Horizonte simulado en ladrillo: mesas, colinas, palmeras y Jericó al fondo
// (mundo lleno, nunca un descampado vacío alrededor).
buildHorizon(scene, 'rio-oasis');

scene.add(new THREE.HemisphereLight(0xffe0b0, 0x6a5a44, 1.35));
const sun = new THREE.DirectionalLight(0xffd08a, 2.2); sun.position.set(6, 22, -30); sun.castShadow = true;
sun.shadow.mapSize.set(1024, 1024); sun.shadow.camera.left = -20; sun.shadow.camera.right = 20; sun.shadow.camera.top = 20; sun.shadow.camera.bottom = -12;
scene.add(sun);

// orillas de arena
const sand = new THREE.Mesh(new THREE.PlaneGeometry(400, 400), new THREE.MeshStandardMaterial({ color: 0xdcc390, roughness: 1 }));
sand.rotation.x = -Math.PI / 2; sand.position.y = -0.02; sand.receiveShadow = true; scene.add(sand);

// ★ el río partido
const river = buildPartedRiver(scene, plastic);

// Ribera vestida (juncos, espadañas, rocas) para que la orilla no esté vacía.
scene.add(buildRiverbank(plastic, { ax: -6, az: 12, bx: -6, bz: -6, clumps: 6, seed: 1 }));
scene.add(buildRiverbank(plastic, { ax: 6, az: 12, bx: 6, bz: -6, clumps: 6, seed: 4 }));
scene.add(buildRiverbank(plastic, { ax: -8, az: 16, bx: 8, bz: 16, clumps: 5, jitter: 0.8, seed: 7 }));

// figuras en el cauce: sacerdotes al frente (llevan el Arca) + Yehoshúa
const priestA = createMinifigure(plastic, PRIEST_SKIN); priestA.root.position.set(-1.6, 0, -2); priestA.root.rotation.y = Math.PI; scene.add(priestA.root);
const priestB = createMinifigure(plastic, PRIEST_SKIN); priestB.root.position.set(1.6, 0, -2); priestB.root.rotation.y = Math.PI; scene.add(priestB.root);
// Arca (cofre dorado con varas) entre los dos sacerdotes
const ark = new THREE.Group();
ark.add(new THREE.Mesh(new THREE.BoxGeometry(1.8, 1.1, 1.0), plastic.get(0xcaa14a)).translateY(2.2));
ark.add(new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.25, 1.2), plastic.get(0xd9b85a)).translateY(2.85));
for (const ax of [-1.0, 1.0]) ark.add(new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 3.2, 6), plastic.get(0x8a6a2a)).rotateX(Math.PI / 2).translateX(ax).translateY(2.1).translateZ(0));
ark.position.set(0, 0, -2); scene.add(ark);
const yeho = createMinifigure(plastic, YOSHUA_SKIN); yeho.root.position.set(0, 0, 5); yeho.root.rotation.y = Math.PI; scene.add(yeho.root);

// El PUEBLO: espera en la orilla (mirando el milagro con asombro) y algunos ya
// entran al cauce siguiendo al Arca. Reusa buildCrowd (variedad + paseantes).
const people = buildCrowd(scene, plastic, [
  { x: -5, z: 10, yaw: Math.PI, emotion: 'surprised' },
  { x: -2.6, z: 12, yaw: Math.PI, emotion: 'worried' },
  { x: 0, z: 13.5, yaw: Math.PI, emotion: 'surprised', scale: 0.66 }, // niño
  { x: 2.6, z: 12, yaw: Math.PI, emotion: 'happy' },
  { x: 5, z: 10, yaw: Math.PI, emotion: 'surprised' },
  { x: -6.5, z: 14, yaw: Math.PI, emotion: 'neutral' },
  { x: 6.5, z: 14, yaw: Math.PI, emotion: 'worried' }
], {
  walkers: [
    { ax: -2, az: 8, bx: -2, bz: 1, speed: 1.2 },   // entran al cauce siguiendo al Arca
    { ax: 2, az: 8.6, bx: 2, bz: 1.6, speed: 1.0, emotion: 'happy' },
    { ax: 0, az: 9, bx: 0, bz: 2.4, speed: 0.9, scale: 0.66 } // niño cruzando
  ]
});

const camera = new THREE.PerspectiveCamera(52, innerWidth / innerHeight, 0.1, 400);
camera.position.set(3.5, 6.5, 20); camera.lookAt(0, 5, -20);

let last = 0;
function loop(ms: number): void {
  requestAnimationFrame(loop);
  const dt = Math.min(0.05, (ms - last) / 1000 || 0.016); last = ms;
  river.update(dt); priestA.update(dt, false); priestB.update(dt, false); yeho.update(dt, false);
  people.update(dt);
  renderer.render(scene, camera);
  (window as any).__ready = true;
}
requestAnimationFrame(loop);
addEventListener('resize', () => { renderer.setSize(innerWidth, innerHeight); camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix(); });
