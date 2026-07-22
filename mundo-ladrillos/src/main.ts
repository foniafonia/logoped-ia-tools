import * as THREE from 'three';
import { PlasticMaterialFactory } from './materials/PlasticMaterialFactory';
import { buildJericho } from './structures/BrickStructureBuilder';
import { createMinifigure, SPY_SKIN } from './characters/MinifigureFactory';
import { ThirdPersonCamera } from './camera/ThirdPersonCamera';
import { CharacterController } from './characters/CharacterController';
import { createStuddedGround } from './world/EnvironmentManager';
import { AudioManager } from './audio/AudioManager';
import { QUALITY, IS_MOBILE } from './core/Quality';
import { TouchControls } from './ui/TouchControls';
import { StoryEngine } from './story/StoryEngine';
import { GUION } from './story/guion';

const app = document.getElementById('app')!;

// ---- Renderer ----
const renderer = new THREE.WebGLRenderer({ antialias: !IS_MOBILE, powerPreference: 'high-performance' });
renderer.setPixelRatio(QUALITY.pixelRatio);
renderer.setSize(innerWidth, innerHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.15;
renderer.shadowMap.enabled = QUALITY.shadows;
renderer.shadowMap.type = IS_MOBILE ? THREE.PCFShadowMap : THREE.PCFSoftShadowMap;
app.appendChild(renderer.domElement);

// ---- Escena de NOCHE (la peli empieza de noche) ----
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0d1524);
scene.fog = new THREE.Fog(0x0d1524, 40, QUALITY.fogFar);

const camera = new THREE.PerspectiveCamera(IS_MOBILE ? 62 : 52, innerWidth / innerHeight, 0.1, 500);
camera.position.set(0, 6, 24);
const tpcam = new ThirdPersonCamera(camera, renderer.domElement);
(window as any).__tpcam = tpcam;

// Luz de luna fría + relleno tenue
const moon = new THREE.DirectionalLight(0xcfe0ff, 2.6);
moon.position.set(-16, 22, 10);
moon.castShadow = QUALITY.shadows;
moon.shadow.mapSize.set(QUALITY.shadowMap, QUALITY.shadowMap);
moon.shadow.camera.near = 1; moon.shadow.camera.far = 160;
moon.shadow.camera.left = -70; moon.shadow.camera.right = 70;
moon.shadow.camera.top = 60; moon.shadow.camera.bottom = -40;
moon.shadow.bias = -0.0003;
scene.add(moon);
scene.add(new THREE.HemisphereLight(0x4a5c7a, 0x14161c, 0.9));

// ---- Materiales de ladrillo ----
const plastic = new PlasticMaterialFactory();

// ---- Suelo + muralla de la ciudad (reusadas) ----
const ground = createStuddedGround(600);
(ground.material as THREE.MeshStandardMaterial).color = new THREE.Color(0x55504a); // apagado, de noche
scene.add(ground);

// Grupo "ciudad" 3D: se puede ocultar en escenas de PLANO FIJO (fondo real)
const city = new THREE.Group();
scene.add(city);

const jericho = buildJericho(plastic);
city.add(jericho.group);

// ---- Casas de la calle (ladrillo) + antorchas cálidas ----
function buildHouse(color: number, w = 6, h = 5, d = 6): THREE.Group {
  const g = new THREE.Group();
  const wall = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), plastic.get(color));
  wall.position.y = h / 2; wall.castShadow = true; wall.receiveShadow = true;
  const roof = new THREE.Mesh(new THREE.BoxGeometry(w + 0.6, 0.6, d + 0.6), plastic.get(0x8a6a3a));
  roof.position.y = h + 0.3; roof.castShadow = true;
  const door = new THREE.Mesh(new THREE.BoxGeometry(1.4, 2.2, 0.2), plastic.get(0x3a2a1a));
  door.position.set(0, 1.1, d / 2 + 0.05);
  g.add(wall, roof, door);
  return g;
}
const HOUSE_COLORS = [0xb9a36f, 0x9a9184, 0xc9b083, 0x86633a, 0xa8895f];
const street: Array<[number, number, number]> = [
  [-11, 10, 0], [-13, 22, 0], [-12, 34, 0],
  [11, 9, 0], [13, 21, 0], [12, 33, 0], [10, 44, 0]
];
street.forEach(([x, z], i) => {
  const house = buildHouse(HOUSE_COLORS[i % HOUSE_COLORS.length]);
  house.position.set(x, 0, z);
  house.rotation.y = x < 0 ? 0.5 : -0.5;
  city.add(house);
});

// Casa de Rahab: más grande, marcada y con un cordón rojo en la ventana
const rahab = buildHouse(0x8f6a3e, 7, 6, 7);
rahab.position.set(-18, 20, 0);
rahab.rotation.y = 0.6;
const cordon = new THREE.Mesh(new THREE.BoxGeometry(0.3, 1.6, 0.3), new THREE.MeshBasicMaterial({ color: 0xd12b2b }));
cordon.position.set(-15.6, 4.2, 22.4);
city.add(rahab, cordon);

// Antorchas cálidas dispersas
for (const [tx, tz] of [[-6, 6], [6, 6], [-16, 30], [8, 28]] as Array<[number, number]>) {
  const flame = new THREE.Mesh(new THREE.ConeGeometry(0.4, 1.2, 8), new THREE.MeshBasicMaterial({ color: 0xffb347 }));
  flame.position.set(tx, 4.6, tz);
  const post = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.18, 4, 6), plastic.get(0x3a2a18));
  post.position.set(tx, 2, tz); post.castShadow = true;
  const light = new THREE.PointLight(0xffa64d, 5, 22, 2); light.position.set(tx, 4.4, tz);
  city.add(flame, post, light);
}

// --- Fondo real de la peli (plano fijo 2.5D): textura de fondo ---
const texLoader = new THREE.TextureLoader();
(window as any).__scene = scene;
(window as any).__city = city;
(window as any).__setBackdrop = (url: string): void => {
  texLoader.load(url, (t) => { t.colorSpace = THREE.SRGBColorSpace; scene.background = t; });
};

// ---- Espía jugable ----
const spy = createMinifigure(plastic, SPY_SKIN);
scene.add(spy.root);
const controller = new CharacterController(spy);
controller.pos.set(0, 0, 46);   // llega desde fuera de la ciudad
if (IS_MOBILE || 'ontouchstart' in window) new TouchControls(controller);
(window as any).__spy = spy; (window as any).__ctrl = controller;

// ---- Audio ----
const audio = new AudioManager();
(window as any).__audio = audio;

// ---- Director de la película jugable ----
const story = new StoryEngine(scene, () => controller.pos, audio, GUION);
(window as any).__story = story;

// ---- Pantalla de inicio (desbloquea audio + arranca la historia) ----
const startEl = document.createElement('div');
startEl.innerHTML =
  '<div style="text-align:center;color:#f4e9d2;font-family:system-ui,sans-serif;padding:24px">' +
  '<div style="font:800 30px/1.1 Georgia,serif;color:#e8b04b;letter-spacing:2px">LA CONQUISTA DE ISRAEL</div>' +
  '<div style="opacity:.8;margin:10px 0 22px">Vive la película · Capítulo 1: El espía en Jericó</div>' +
  '<button id="startBtn" style="font:800 20px/1 system-ui;color:#0a0705;background:#e8b04b;border:none;border-radius:14px;padding:16px 30px;cursor:pointer">▶ Empezar</button>' +
  '<div style="opacity:.7;font-size:13px;margin-top:14px">🔊 Sube el volumen</div></div>';
Object.assign(startEl.style, {
  position: 'fixed', inset: '0', zIndex: '50', display: 'flex', alignItems: 'center',
  justifyContent: 'center', background: 'radial-gradient(120% 100% at 50% 0%, #12203a, #05070c 72%)', transition: 'opacity .4s'
} as CSSStyleDeclaration);
document.body.appendChild(startEl);
const startGame = (): void => {
  audio.init();
  story.start();
  startEl.style.opacity = '0';
  setTimeout(() => startEl.remove(), 420);
};
startEl.addEventListener('pointerdown', startGame, { once: true });

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
  story.update(dt);
  tpcam.update(controller.pos);
  renderer.render(scene, camera);
}
requestAnimationFrame(animate);
(window as any).__READY__ = true;
