import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { PlasticMaterialFactory } from './materials/PlasticMaterialFactory';
import { createMinifigure } from './characters/MinifigureFactory';
import { ThirdPersonCamera } from './camera/ThirdPersonCamera';
import { CharacterController } from './characters/CharacterController';
import { setupEnvironment } from './world/EnvironmentManager';
import { AudioManager } from './audio/AudioManager';
import { QUALITY, IS_MOBILE } from './core/Quality';
import { TouchControls } from './ui/TouchControls';
import { buildCamp, VILLAGER_SKIN } from './scenes/min00/camp';

const app = document.getElementById('app')!;

// ---- Renderer ----
const renderer = new THREE.WebGLRenderer({ antialias: !IS_MOBILE, powerPreference: 'high-performance' });
renderer.setPixelRatio(QUALITY.pixelRatio);
renderer.setSize(innerWidth, innerHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.02;
renderer.shadowMap.enabled = QUALITY.shadows;
renderer.shadowMap.type = IS_MOBILE ? THREE.PCFShadowMap : THREE.PCFSoftShadowMap;
app.appendChild(renderer.domElement);

// ---- Escena: atardecer dorado (campamento, minuto 0–5) ----
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xf0d9a8);
scene.fog = new THREE.Fog(0xf0d9a8, 45, QUALITY.fogFar);
if (QUALITY.envMap) {
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
}

const camera = new THREE.PerspectiveCamera(IS_MOBILE ? 62 : 52, innerWidth / innerHeight, 0.1, 500);
camera.position.set(0, 6, 24);
const tpcam = new ThirdPersonCamera(camera, renderer.domElement);
(window as any).__tpcam = tpcam;

// ---- Luz de atardecer ----
scene.add(new THREE.HemisphereLight(0xffe9c0, 0xa9895f, 0.55));
const key = new THREE.DirectionalLight(0xffd9a0, 3.0);
key.position.set(-18, 14, 16);
key.castShadow = QUALITY.shadows;
key.shadow.mapSize.set(QUALITY.shadowMap, QUALITY.shadowMap);
key.shadow.camera.near = 1; key.shadow.camera.far = 160;
key.shadow.camera.left = -60; key.shadow.camera.right = 60;
key.shadow.camera.top = 60; key.shadow.camera.bottom = -30;
key.shadow.bias = -0.0002; key.shadow.normalBias = 0.02;
scene.add(key);

const plastic = new PlasticMaterialFactory();

// === ENTORNO (cielo de atardecer + dunas + suelo) ===
setupEnvironment(scene);

// === CAMPAMENTO DE ISRAEL (minuto 0–5) ===
const camp = buildCamp(scene, plastic);

// === JUGADOR: un joven levita del campamento ===
const villager = createMinifigure(plastic, VILLAGER_SKIN);
scene.add(villager.root);
const controller = new CharacterController(villager);
controller.pos.set(0, 0, 64);
if (IS_MOBILE || 'ontouchstart' in window) new TouchControls(controller);
(window as any).__spy = villager; (window as any).__ctrl = controller;

// === AUDIO (para ambiente futuro) ===
const audio = new AudioManager();
(window as any).__audio = audio;

// ---- HUD del objetivo ----
const obj = document.createElement('div');
Object.assign(obj.style, {
  position: 'fixed', left: '50%', top: '54px', transform: 'translateX(-50%)', zIndex: '20',
  background: 'rgba(20,40,60,.78)', color: '#dff3ff', font: '700 16px system-ui, sans-serif',
  padding: '8px 16px', borderRadius: '20px', border: '1px solid rgba(143,224,255,.6)', pointerEvents: 'none'
} as CSSStyleDeclaration);
document.body.appendChild(obj);
const flash = document.createElement('div');
Object.assign(flash.style, {
  position: 'fixed', left: '50%', top: '40%', transform: 'translate(-50%,-50%)', zIndex: '21',
  color: '#bfffce', font: '800 28px system-ui, sans-serif', textShadow: '0 2px 12px rgba(0,0,0,.7)',
  opacity: '0', transition: 'opacity .3s', pointerEvents: 'none', textAlign: 'center'
} as CSSStyleDeclaration);
document.body.appendChild(flash);
let collected = 0;
const total = camp.ropes.length;
const updateObj = (): void => { obj.textContent = `🎯 Recoge las cuerdas del campamento  (${collected}/${total})`; };
updateObj();

// ---- Pantalla de inicio ----
const startEl = document.createElement('div');
startEl.innerHTML =
  '<div style="text-align:center;color:#f4e9d2;font-family:system-ui,sans-serif;padding:24px">' +
  '<div style="font:800 30px/1.1 Georgia,serif;color:#e8b04b;letter-spacing:2px">LA CONQUISTA DE ISRAEL</div>' +
  '<div style="opacity:.8;margin:10px 0 22px">Minuto 0–5 · El campamento de Israel</div>' +
  '<button id="startBtn" style="font:800 20px/1 system-ui;color:#0a0705;background:#e8b04b;border:none;border-radius:14px;padding:16px 30px;cursor:pointer;box-shadow:0 6px 18px rgba(0,0,0,.5)">▶ Empezar</button></div>';
Object.assign(startEl.style, {
  position: 'fixed', inset: '0', zIndex: '50', display: 'flex', alignItems: 'center',
  justifyContent: 'center', background: 'radial-gradient(120% 100% at 50% 0%, #3a2a12, #0a0705 72%)', transition: 'opacity .4s'
} as CSSStyleDeclaration);
document.body.appendChild(startEl);
startEl.addEventListener('pointerdown', () => {
  audio.init();
  startEl.style.opacity = '0';
  setTimeout(() => startEl.remove(), 420);
}, { once: true });

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
  // recoger cuerdas: acercarse a cada una
  for (const rope of camp.ropes) {
    if (!rope.visible) continue;
    rope.rotation.z += dt * 1.5;
    if (controller.pos.distanceTo(rope.position) < 2.6) {
      rope.visible = false;
      collected++; updateObj();
      if (collected >= total) {
        flash.textContent = '✅ ¡Campamento recogido! Rumbo a Jericó';
        flash.style.opacity = '1';
      }
    }
  }
  tpcam.update(controller.pos);
  renderer.render(scene, camera);
}
requestAnimationFrame(animate);
(window as any).__READY__ = true;
