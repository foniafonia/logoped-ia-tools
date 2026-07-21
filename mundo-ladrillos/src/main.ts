import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { PlasticMaterialFactory } from './materials/PlasticMaterialFactory';
import { buildJericho, buildCourtyard, buildApproach } from './structures/BrickStructureBuilder';
import { createMinifigure, SPY_SKIN } from './characters/MinifigureFactory';
import { ThirdPersonCamera } from './camera/ThirdPersonCamera';
import { CharacterController } from './characters/CharacterController';
import { setupEnvironment } from './world/EnvironmentManager';
import { AudioManager } from './audio/AudioManager';
import { ShofarInteraction } from './interactions/ShofarInteraction';
import { QUALITY, IS_MOBILE } from './core/Quality';
import { TouchControls } from './ui/TouchControls';
import { Army } from './world/Army';
import { buildScenery } from './world/Scenery';
import { Dust } from './effects/Dust';

const app = document.getElementById('app')!;

// ---- Renderer (gestión de color + tonemapping cinematográfico) ----
const renderer = new THREE.WebGLRenderer({ antialias: !IS_MOBILE, alpha: false, powerPreference: 'high-performance' });
renderer.setPixelRatio(QUALITY.pixelRatio);
renderer.setSize(innerWidth, innerHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.02;
renderer.shadowMap.enabled = QUALITY.shadows;
renderer.shadowMap.type = IS_MOBILE ? THREE.PCFShadowMap : THREE.PCFSoftShadowMap;
app.appendChild(renderer.domElement);

// ---- Escena + niebla suave (atardecer dorado, como la peli) ----
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xf0d9a8);
scene.fog = new THREE.Fog(0xf0d9a8, 45, QUALITY.fogFar);

// Reflejos del clearcoat (PMREM) solo en equipos capaces (en móvil se omite)
if (QUALITY.envMap) {
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
}

// ---- Cámara ----
const camera = new THREE.PerspectiveCamera(IS_MOBILE ? 62 : 52, innerWidth / innerHeight, 0.1, 500);
camera.position.set(0, 6, 24);
const tpcam = new ThirdPersonCamera(camera, renderer.domElement);
(window as any).__tpcam = tpcam;

// ---- Iluminación de cine (sol de atardecer bajo y cálido) ----
const hemi = new THREE.HemisphereLight(0xffe9c0, 0xa9895f, 0.5);
scene.add(hemi);

const key = new THREE.DirectionalLight(0xffd9a0, 3.0);
key.position.set(-18, 10, 14);
key.castShadow = QUALITY.shadows;
key.shadow.mapSize.set(QUALITY.shadowMap, QUALITY.shadowMap);
key.shadow.camera.near = 1;
key.shadow.camera.far = 150;
key.shadow.camera.left = -70;
key.shadow.camera.right = 70;
key.shadow.camera.top = 45;
key.shadow.camera.bottom = -45;
key.shadow.bias = -0.0002;
key.shadow.normalBias = 0.02;
scene.add(key);

const fill = new THREE.DirectionalLight(0xbcd2ff, 0.35);
fill.position.set(12, 6, -6);
scene.add(fill);

// ---- Fábrica de materiales de plástico ----
const plastic = new PlasticMaterialFactory();

// === MURALLA DE JERICÓ (grande, por franjas) ===
const jericho = buildJericho(plastic);
scene.add(jericho.group);

// === RECINTO AMURALLADO: cierra la plaza (muros laterales + trasero + torres) ===
scene.add(buildCourtyard(plastic));
// === CAMINO de aproximación (por donde marcha el ejército) ===
scene.add(buildApproach(plastic));

// === PERSONAJE JUGABLE: el espía (Fase 3) ===
const spy = createMinifigure(plastic, SPY_SKIN);
scene.add(spy.root);
const controller = new CharacterController(spy);
if (IS_MOBILE || 'ontouchstart' in window) new TouchControls(controller);
(window as any).__spy = spy; // depuración
(window as any).__ctrl = controller;

// === ENTORNO (cielo de atardecer + dunas + suelo) ===
setupEnvironment(scene);

// === ÉPICO: ejército que marcha y combate, columnas/antorchas y polvo ===
const army = new Army();
scene.add(army.group);
scene.add(buildScenery(plastic));
const dust = new Dust(scene);
(window as any).__army = army;

// === AUDIO (se activa con el primer gesto del usuario) ===
const audio = new AudioManager();
(window as any).__audio = audio;

// Pantalla de inicio: el toque desbloquea el sonido (clave en móvil/artifact)
const startEl = document.createElement('div');
startEl.innerHTML =
  '<div style="text-align:center;color:#f4e9d2;font-family:system-ui,sans-serif;padding:24px">' +
  '<div style="font:800 30px/1.1 Georgia,serif;color:#e8b04b;letter-spacing:2px">LA CONQUISTA DE ISRAEL</div>' +
  '<div style="opacity:.8;margin:10px 0 22px">Marcha con el ejército hasta Jericó · toca el shofar 🎺 y derriba la muralla</div>' +
  '<button id="startBtn" style="font:800 20px/1 system-ui;color:#0a0705;background:#e8b04b;border:none;border-radius:14px;padding:16px 30px;cursor:pointer;box-shadow:0 6px 18px rgba(0,0,0,.5)">▶ Tocar para empezar</button>' +
  '<div style="opacity:.7;font-size:13px;margin-top:14px">🔊 Activa el sonido · sube el volumen</div></div>';
Object.assign(startEl.style, {
  position: 'fixed', inset: '0', zIndex: '50', display: 'flex', alignItems: 'center',
  justifyContent: 'center', background: 'radial-gradient(120% 100% at 50% 0%, #241708, #0a0705 72%)',
  transition: 'opacity .4s'
} as CSSStyleDeclaration);
document.body.appendChild(startEl);
let din: { stop: (f?: number) => void } | null = null;
const startGame = (): void => {
  audio.init();                 // desbloquea + decodifica dentro del gesto
  army.start();                 // el ejército empieza a marchar contigo
  din = audio.loop('din', 0.42); // estruendo de la tropa que te acompaña
  startEl.style.opacity = '0';
  setTimeout(() => startEl.remove(), 420);
};
startEl.addEventListener('pointerdown', startGame, { once: true });
// respaldo: cualquier tecla/toque también activa el audio
addEventListener('keydown', () => audio.init(), { once: true });

// === INTERACCIÓN: encuentra el shofar y derrumba la muralla ===
const shofarGame = new ShofarInteraction(scene, plastic, audio, jericho, () => controller.pos, dust, () => {
  army.startBattle();
  din?.stop(1.2);   // el estruendo de marcha da paso al fragor de la batalla
});
void jericho.wallWidth;
(window as any).__jericho = jericho;

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
  army.update(dt, now / 1000);
  shofarGame.update(dt);
  dust.update(dt);
  tpcam.update(controller.pos);
  renderer.render(scene, camera);
}
requestAnimationFrame(animate);

// Señal para las capturas automáticas (headless)
(window as any).__READY__ = true;
