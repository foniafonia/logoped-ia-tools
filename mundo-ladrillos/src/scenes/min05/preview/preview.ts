import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { PlasticMaterialFactory } from '../../../materials/PlasticMaterialFactory';
import { ThirdPersonCamera } from '../../../camera/ThirdPersonCamera';
import { createMinifigure, YOSHUA_SKIN, SPY_SKIN, SPY2_SKIN, MinifigureSkin } from '../../../characters/MinifigureFactory';
import { createStuddedGround } from '../../../world/EnvironmentManager';
import { PreviewController } from './PreviewController';
import { MIN05_SCENES } from '../registry';
import { Min05Scene, SceneInstance } from '../types';

/**
 * PREVIEW del tramo MINUTO 5–10. App autocontenida para PROBAR las escenas 3D
 * de ladrillo: selector de las 8 escenas, jugador controlable, HUD con el
 * objetivo y detección de éxito. Sirve también para las capturas headless
 * (?scene=NN&shot=1). NO forma parte del juego final: el lead integra los
 * descriptores `Min05Scene` en el StoryEngine compartido.
 */

const app = document.getElementById('app')!;

const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.setSize(innerWidth, innerHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.02;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
app.appendChild(renderer.domElement);

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(52, innerWidth / innerHeight, 0.1, 600);
camera.position.set(0, 8, 28);
const tpcam = new ThirdPersonCamera(camera, renderer.domElement);

// PMREM para el brillo de plástico
const pmrem = new THREE.PMREMGenerator(renderer);
const envTex = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
scene.environment = envTex;

const plastic = new PlasticMaterialFactory();

// --- Luces (se reconfiguran día/noche por escena) ---
const hemi = new THREE.HemisphereLight(0xffe9c0, 0xa9895f, 0.5);
scene.add(hemi);
const key = new THREE.DirectionalLight(0xffd9a0, 3.0);
key.position.set(-18, 24, 14);
key.castShadow = true;
key.shadow.mapSize.set(2048, 2048);
key.shadow.camera.near = 1; key.shadow.camera.far = 200;
key.shadow.camera.left = -80; key.shadow.camera.right = 80;
key.shadow.camera.top = 80; key.shadow.camera.bottom = -60;
key.shadow.bias = -0.0002; key.shadow.normalBias = 0.02;
scene.add(key);
const fill = new THREE.DirectionalLight(0xbcd2ff, 0.35);
fill.position.set(12, 10, -6);
scene.add(fill);

// --- Suelo base compartido (placa con tetones) ---
const ground = createStuddedGround(600);
scene.add(ground);

const groundMat = ground.material as THREE.MeshStandardMaterial;
function applyAmbience(noche: boolean): void {
  if (noche) {
    // De noche NO usamos el entorno PMREM (una sala luminosa) porque lava la
    // escena; la luz la ponen la luna tenue + las antorchas (luces puntuales).
    scene.environment = null;
    renderer.toneMappingExposure = 0.98;
    scene.background = new THREE.Color(0x0e1a2c);
    scene.fog = new THREE.Fog(0x0e1a2c, 40, 180);
    hemi.color.setHex(0x33486e); hemi.groundColor.setHex(0x0c1220); hemi.intensity = 0.55;
    key.color.setHex(0x9fbcf0); key.intensity = 1.05;       // luz de luna fría
    key.position.set(22, 40, -18);
    fill.color.setHex(0x2a4778); fill.intensity = 0.28;
    groundMat.color?.setHex(0x46566e);
    groundMat.emissive?.setHex(0x080c14);
  } else {
    scene.environment = envTex;
    renderer.toneMappingExposure = 1.02;
    scene.background = new THREE.Color(0xf0d9a8);
    scene.fog = new THREE.Fog(0xf0d9a8, 55, 320);
    hemi.color.setHex(0xffe9c0); hemi.groundColor.setHex(0xa9895f); hemi.intensity = 0.5;
    key.color.setHex(0xffd9a0); key.intensity = 3.0;
    key.position.set(-18, 24, 14);
    fill.color.setHex(0xbcd2ff); fill.intensity = 0.35;
    groundMat.color?.setHex(0xffffff);
    groundMat.emissive?.setHex(0x000000);
  }
}

// --- Jugador (skin según la escena) ---
const skins: Record<string, MinifigureSkin> = { yoshua: YOSHUA_SKIN, spy: SPY_SKIN, spy2: SPY2_SKIN };
let playerSkin = 'spy';
let player = createMinifigure(plastic, SPY_SKIN);
scene.add(player.root);
let controller = new PreviewController(player);

function setPlayerSkin(which: string): void {
  if (which === playerSkin) return;
  playerSkin = which;
  scene.remove(player.root);
  player = createMinifigure(plastic, skins[which] ?? SPY_SKIN);
  scene.add(player.root);
  const oldPos = controller.pos.clone();
  controller = new PreviewController(player);
  controller.teleport(oldPos.x, oldPos.z);
}

// --- HUD ---
function mkDiv(style: Partial<CSSStyleDeclaration>): HTMLDivElement {
  const d = document.createElement('div');
  Object.assign(d.style, { position: 'fixed', zIndex: '20', pointerEvents: 'none' } as CSSStyleDeclaration, style);
  document.body.appendChild(d);
  return d;
}
const titleEl = mkDiv({ left: '50%', top: '10px', transform: 'translateX(-50%)', color: '#e8b04b', font: '800 20px Georgia, serif', textShadow: '0 2px 8px rgba(0,0,0,.7)' });
const objEl = mkDiv({ left: '50%', top: '46px', transform: 'translateX(-50%)', maxWidth: '86%', background: 'rgba(20,40,60,.78)', color: '#dff3ff', font: '700 15px system-ui', padding: '7px 15px', borderRadius: '18px', textAlign: 'center', border: '1px solid rgba(143,224,255,.6)' });
const subEl = mkDiv({ left: '50%', bottom: '58px', transform: 'translateX(-50%)', maxWidth: '86%', background: 'rgba(8,6,4,.72)', color: '#ffeecb', font: '500 16px/1.35 Georgia, serif', padding: '9px 16px', borderRadius: '12px', textAlign: 'center', border: '1px solid rgba(232,176,75,.35)' });
const statusEl = mkDiv({ left: '50%', top: '82px', transform: 'translateX(-50%)', color: '#ffd', font: '700 15px system-ui', textShadow: '0 2px 8px rgba(0,0,0,.8)' });
const flashEl = mkDiv({ left: '50%', top: '42%', transform: 'translate(-50%,-50%)', color: '#bfffce', font: '800 28px system-ui', textShadow: '0 2px 12px rgba(0,0,0,.7)', textAlign: 'center' });

// --- Selector de escenas ---
const bar = document.createElement('div');
Object.assign(bar.style, { position: 'fixed', left: '8px', bottom: '8px', zIndex: '30', display: 'flex', gap: '5px', flexWrap: 'wrap', maxWidth: '60%' } as CSSStyleDeclaration);
document.body.appendChild(bar);
MIN05_SCENES.forEach((s, i) => {
  const b = document.createElement('button');
  b.textContent = String(s.numero);
  Object.assign(b.style, { font: '700 14px system-ui', color: '#0a0705', background: '#e8b04b', border: 'none', borderRadius: '8px', padding: '7px 11px', cursor: 'pointer' } as CSSStyleDeclaration);
  b.title = s.titulo;
  b.onclick = () => loadScene(i);
  bar.appendChild(b);
});
const hint = mkDiv({ right: '10px', bottom: '10px', color: '#cfe', font: '12px system-ui', background: 'rgba(0,0,0,.4)', padding: '5px 9px', borderRadius: '8px' });
hint.textContent = 'WASD/flechas mover · Shift correr · arrastra cámara';

// --- Gestión de escena activa ---
let current: SceneInstance | null = null;
let currentDef: Min05Scene | null = null;
let done = false;

function disposeGroup(g: THREE.Group): void {
  g.traverse((o: THREE.Object3D) => {
    const m = o as THREE.Mesh;
    if (m.geometry) m.geometry.dispose();
  });
}

function loadScene(i: number): void {
  const def = MIN05_SCENES[((i % MIN05_SCENES.length) + MIN05_SCENES.length) % MIN05_SCENES.length];
  if (current) {
    scene.remove(current.group);
    current.dispose?.();
    disposeGroup(current.group);
  }
  currentDef = def;
  done = false;
  applyAmbience(!!def.noche);
  setPlayerSkin(def.jugador ?? 'spy');

  const ctx = {
    scene, plastic,
    getPlayer: () => controller.pos,
    setPlayer: (x: number, z: number) => controller.teleport(x, z),
    markDone: () => { done = true; }
  };
  current = def.build(ctx);

  // límites de escena generosos según el objetivo
  controller.setBounds(-70, 70, def.spawn.z - 6, (def.objetivo.target?.z ?? def.spawn.z) + 24);
  controller.teleport(def.spawn.x, def.spawn.z);

  if (def.camara) {
    tpcam.yaw = def.camara.yaw ?? 0;
    tpcam.pitch = def.camara.pitch ?? 0.42;
    tpcam.dist = def.camara.dist ?? 28;
  }

  titleEl.textContent = `Escena ${def.numero} · ${def.titulo}`;
  objEl.textContent = def.objetivo.tipo === 'cinematica' ? '' : '🎯 ' + def.objetivo.texto;
  objEl.style.display = def.objetivo.tipo === 'cinematica' ? 'none' : 'block';
  subEl.textContent = def.subtitulo;
  flashEl.textContent = '';
  (window as any).__SCENE_READY__ = true;
}

(window as any).__loadScene = loadScene;
(window as any).__loadNumero = (n: number) => {
  const idx = MIN05_SCENES.findIndex((s) => s.numero === n);
  if (idx >= 0) loadScene(idx);
};

// escena inicial por URL (?scene=NN) o la primera
const params = new URLSearchParams(location.search);
const startNum = parseInt(params.get('scene') || '', 10);
const startIdx = Number.isFinite(startNum) ? MIN05_SCENES.findIndex((s) => s.numero === startNum) : 0;
loadScene(startIdx >= 0 ? startIdx : 0);

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
  if (current && currentDef) {
    current.update(dt, now / 1000, controller.pos);
    const st = current.status?.() ?? null;
    statusEl.textContent = st ?? '';
    if (!done && current.isDone(controller.pos)) {
      done = true;
      flashEl.textContent = '✅ ' + currentDef.exito;
    }
  }
  tpcam.update(controller.pos);
  renderer.render(scene, camera);
}
requestAnimationFrame(animate);

(window as any).__READY__ = true;
