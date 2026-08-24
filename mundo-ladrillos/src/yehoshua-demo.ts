import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { setupPreciousRender } from './core/PreciousRender';
import { PlasticMaterialFactory } from './materials/PlasticMaterialFactory';
import { createMinifigure, YOSHUA_SKIN, type Emotion, type Minifigure } from './characters/MinifigureFactory';

/**
 * ESTUDIO DE FIDELIDAD — Yehoshúa EN ACCIÓN.
 * Espacio vacío (fondo blanco, luz de estudio uniforme, sombra de contacto tenue,
 * cámara a la altura del torso) tal como pide la hoja de personaje oficial. El
 * muñeco camina, saluda/gesticula y cambia de expresión para comprobar cómo se
 * mueve el Yehoshúa reconstruido. Sin escenografía: aquí solo importa el personaje.
 */

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(innerWidth, innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.body.appendChild(renderer.domElement);

const scene = new THREE.Scene();
const BG_LIGHT = new THREE.Color(0xf7f7f8);
const BG_DARK = new THREE.Color(0x1d1f24);
scene.background = BG_LIGHT.clone();

const plastic = new PlasticMaterialFactory();
plastic.update({ roughness: 0.32, clearcoat: 0.55, envMapIntensity: 1.15 });

// Suelo blanco que solo recoge una sombra de contacto muy tenue.
const floor = new THREE.Mesh(
  new THREE.PlaneGeometry(80, 80),
  new THREE.ShadowMaterial({ opacity: 0.3 })
);
floor.rotation.x = -Math.PI / 2;
floor.receiveShadow = true;
scene.add(floor);
(window as any).__floor = floor;   // permite ocultarlo al medir la silueta

// ILUMINACIÓN DE PRODUCTO: key grande y suave + fill + rim discreta.
// Una luz plana y uniforme aplana el volumen; esto lo modela.
scene.add(new THREE.HemisphereLight(0xffffff, 0xd8d8dc, 0.62));   // ambiente contenido
// KEY: grande, alta y ligeramente a la izquierda; es la que da la forma.
const key = new THREE.DirectionalLight(0xfffaf2, 2.1);
key.position.set(-4.5, 9.5, 7.5);
key.castShadow = true;
key.shadow.mapSize.set(2048, 2048);
key.shadow.camera.near = 1; key.shadow.camera.far = 40;
key.shadow.camera.left = -7; key.shadow.camera.right = 7;
key.shadow.camera.top = 8; key.shadow.camera.bottom = -3;
key.shadow.radius = 9; key.shadow.bias = -0.0004;
scene.add(key);
// FILL: suave desde el lado opuesto, sin sombra, para abrir las sombras.
const fill = new THREE.DirectionalLight(0xeef2ff, 0.75); fill.position.set(6, 3.5, 5); scene.add(fill);
// RIM: recorta el contorno contra el fondo y separa la figura.
const rim = new THREE.DirectionalLight(0xffffff, 1.15); rim.position.set(2.5, 5.5, -7); scene.add(rim);
const rim2 = new THREE.DirectionalLight(0xffffff, 0.5); rim2.position.set(-5, 3, -5); scene.add(rim2);

// --- El personaje (se puede reconstruir para cambiar la expresión) ---
const EMOTIONS: Emotion[] = ['worried', 'neutral', 'stern', 'alert', 'happy', 'awe'];
let emoIdx = 0;
let yeho: Minifigure;

function buildYeho(): void {
  if (yeho) scene.remove(yeho.root);
  yeho = createMinifigure(plastic, { ...YOSHUA_SKIN, emotion: EMOTIONS[emoIdx] });
  yeho.root.traverse((o) => { if ((o as THREE.Mesh).isMesh && !o.userData.noShadow) o.castShadow = true; });
  scene.add(yeho.root);
  const el = document.getElementById('emo'); if (el) el.textContent = EMOTIONS[emoIdx];
}
buildYeho();

const TORSO_Y = 2.8;
const camera = new THREE.PerspectiveCamera(20, innerWidth / innerHeight, 0.1, 200);   // ≈85 mm
const HOME = new THREE.Vector3(0, TORSO_Y, 20);
camera.position.copy(HOME);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true; controls.dampingFactor = 0.08;
controls.target.set(0, TORSO_Y - 0.3, 0);
controls.minDistance = 9; controls.maxDistance = 34;
controls.maxPolarAngle = Math.PI * 0.52;
controls.update();

const fx = setupPreciousRender(renderer, scene, camera, {
  exposure: 1.12,
  bloom: { strength: 0.08, radius: 0.4, threshold: 1.0 }
});

// --- Interacción / acción ---
let walking = true;      // arranca caminando en el sitio (en acción)
let turntable = false;
let dark = false;
function setState(el: string, v: string): void { const n = document.getElementById(el); if (n) n.textContent = v; }
setState('walk', 'sí');

addEventListener('keydown', (e) => {
  const k = e.key.toLowerCase();
  if (k === 'w') { walking = !walking; setState('walk', walking ? 'sí' : 'no'); }
  else if (e.code === 'Space') { e.preventDefault(); yeho.attack(); }   // gesto/saludo del brazo
  else if (k === 'e') { emoIdx = (emoIdx + 1) % EMOTIONS.length; buildYeho(); }
  else if (k === 'g') { turntable = !turntable; }
  else if (k === 'r') { camera.position.copy(HOME); controls.target.set(0, TORSO_Y - 0.3, 0); controls.update(); }
  else if (k === 'f') { dark = !dark; scene.background = (dark ? BG_DARK : BG_LIGHT).clone(); }
});

// Ganchos para grabar el vídeo de presentación (giro y órbita dirigidos).
(window as any).__rig = {
  get fig() { return yeho.root; },
  camera, controls,
  setTurn(on: boolean) { turntable = on; },
  setWalk(on: boolean) { walking = on; }
};

const clock = new THREE.Clock();
function loop(): void {
  requestAnimationFrame(loop);
  const dt = Math.min(clock.getDelta(), 0.05);
  if (turntable) yeho.root.rotation.y += dt * 0.5;
  yeho.update(dt, walking, 1);
  controls.update();
  fx.render();
  (window as any).__ready = true;
}
loop();

addEventListener('resize', () => {
  renderer.setSize(innerWidth, innerHeight);
  fx.setSize(innerWidth, innerHeight);
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
});
