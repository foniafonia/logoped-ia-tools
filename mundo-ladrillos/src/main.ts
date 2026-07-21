import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { PlasticMaterialFactory } from './materials/PlasticMaterialFactory';
import { buildJericho } from './structures/BrickStructureBuilder';
import { createMinifigure, SPY_SKIN } from './characters/MinifigureFactory';
import { ThirdPersonCamera } from './camera/ThirdPersonCamera';
import { CharacterController } from './characters/CharacterController';

const app = document.getElementById('app')!;

// ---- Renderer (gestión de color + tonemapping cinematográfico) ----
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.setSize(innerWidth, innerHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.02;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
app.appendChild(renderer.domElement);

// ---- Escena + niebla suave (atardecer dorado, como la peli) ----
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xf0d9a8);
scene.fog = new THREE.Fog(0xf0d9a8, 55, 150);

// Entorno para reflejos del clearcoat (sin cargar archivos)
const pmrem = new THREE.PMREMGenerator(renderer);
scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;

// ---- Cámara ----
const camera = new THREE.PerspectiveCamera(45, innerWidth / innerHeight, 0.1, 500);
camera.position.set(0, 6, 24);
const tpcam = new ThirdPersonCamera(camera, renderer.domElement);

// ---- Iluminación de cine (sol de atardecer bajo y cálido) ----
const hemi = new THREE.HemisphereLight(0xffe9c0, 0xa9895f, 0.5);
scene.add(hemi);

const key = new THREE.DirectionalLight(0xffd9a0, 3.0);
key.position.set(-18, 10, 14);
key.castShadow = true;
key.shadow.mapSize.set(2048, 2048);
key.shadow.camera.near = 1;
key.shadow.camera.far = 90;
key.shadow.camera.left = -34;
key.shadow.camera.right = 34;
key.shadow.camera.top = 30;
key.shadow.camera.bottom = -30;
key.shadow.bias = -0.0002;
key.shadow.normalBias = 0.02;
scene.add(key);

const fill = new THREE.DirectionalLight(0xbcd2ff, 0.35);
fill.position.set(12, 6, -6);
scene.add(fill);

// ---- Suelo que recibe sombra ----
const ground = new THREE.Mesh(
  new THREE.PlaneGeometry(400, 400),
  new THREE.MeshStandardMaterial({ color: 0xd8c79c, roughness: 0.95, metalness: 0 })
);
ground.rotation.x = -Math.PI / 2;
ground.position.y = -0.42;
ground.receiveShadow = true;
scene.add(ground);

// ---- Fábrica de materiales de plástico ----
const plastic = new PlasticMaterialFactory();

// === MURALLA DE JERICÓ (Fase 2) ===
const jericho = buildJericho(plastic);
scene.add(jericho);

// === PERSONAJE JUGABLE: el espía (Fase 3) ===
const spy = createMinifigure(plastic, SPY_SKIN);
scene.add(spy.root);
const controller = new CharacterController(spy);
(window as any).__spy = spy; // depuración

// ---- Bucle ----
addEventListener('resize', () => {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
});

let last = 0;
function animate(now: number): void {
  requestAnimationFrame(animate);
  const dt = Math.min(0.05, (now - last) / 1000 || 0.016);
  last = now;
  controller.update(dt, tpcam.yaw);
  tpcam.update(controller.pos);
  renderer.render(scene, camera);
}
requestAnimationFrame(animate);

// Señal para las capturas automáticas (headless)
(window as any).__READY__ = true;
