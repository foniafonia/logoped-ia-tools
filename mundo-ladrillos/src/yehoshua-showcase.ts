import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { setupPreciousRender } from './core/PreciousRender';
import { PlasticMaterialFactory } from './materials/PlasticMaterialFactory';
import { createMinifigure, YOSHUA_SKIN } from './characters/MinifigureFactory';

/**
 * PRESENTACIÓN de Yehoshúa: arranca solo, girando y caminando, en el estudio
 * vacío. Pensado para enseñar el personaje, no para depurarlo: sin panel de
 * controles ni atajos de trabajo. Al tocarlo, el giro automático se detiene y
 * pasas a manejarlo tú; si lo sueltas un rato, vuelve a girar.
 */

// Aviso claro si el dispositivo no puede con 3D, en vez de una página en blanco.
const canWebGL = (() => {
  try { const c = document.createElement('canvas');
    return !!(c.getContext('webgl2') || c.getContext('webgl')); } catch { return false; }
})();
if (!canWebGL) {
  const f = document.getElementById('fallback');
  if (f) f.style.display = 'grid';
  const h = document.getElementById('hint'); if (h) h.style.display = 'none';
  throw new Error('sin WebGL');
}

// En móvil se baja la carga: menos píxeles y sombra más barata, para que vaya fluido.
const MOBILE = matchMedia('(hover: none)').matches || Math.min(innerWidth, innerHeight) < 620;
const renderer = new THREE.WebGLRenderer({ antialias: !MOBILE, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(devicePixelRatio, MOBILE ? 2 : 2));
renderer.setSize(innerWidth, innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = MOBILE ? THREE.PCFShadowMap : THREE.PCFSoftShadowMap;
document.body.appendChild(renderer.domElement);

/** El visor puede forzar tema con data-theme; si no, manda el del sistema. */
function isDark(): boolean {
  const t = document.documentElement.getAttribute('data-theme');
  if (t === 'dark') return true;
  if (t === 'light') return false;
  return matchMedia('(prefers-color-scheme: dark)').matches;
}
let dark = isDark();
const scene = new THREE.Scene();
scene.background = new THREE.Color(dark ? 0x14161a : 0xf2f2f4);

const plastic = new PlasticMaterialFactory();
plastic.update({ roughness: 0.32, clearcoat: 0.55, envMapIntensity: 1.15 });

const floor = new THREE.Mesh(
  new THREE.PlaneGeometry(90, 90),
  new THREE.ShadowMaterial({ opacity: dark ? 0.45 : 0.3 })
);
floor.rotation.x = -Math.PI / 2;
floor.receiveShadow = true;
scene.add(floor);

// Luz de producto: key grande y suave + fill + doble rim para recortar el borde.
const hemi = new THREE.HemisphereLight(0xffffff, 0xd8d8dc, dark ? 0.34 : 0.5);
scene.add(hemi);
const key = new THREE.DirectionalLight(0xfffaf2, 1.85);
key.position.set(-4.5, 9.5, 7.5);
key.castShadow = true;
key.shadow.mapSize.set(MOBILE ? 1024 : 2048, MOBILE ? 1024 : 2048);
key.shadow.camera.near = 1; key.shadow.camera.far = 40;
key.shadow.camera.left = -7; key.shadow.camera.right = 7;
key.shadow.camera.top = 8; key.shadow.camera.bottom = -3;
key.shadow.radius = 9; key.shadow.bias = -0.0004;
scene.add(key);
const fill = new THREE.DirectionalLight(0xeef2ff, 0.62); fill.position.set(6, 3.5, 5); scene.add(fill);
const rim = new THREE.DirectionalLight(0xffffff, 1.15); rim.position.set(2.5, 5.5, -7); scene.add(rim);
const rim2 = new THREE.DirectionalLight(0xffffff, 0.5); rim2.position.set(-5, 3, -5); scene.add(rim2);

const yeho = createMinifigure(plastic, YOSHUA_SKIN);
yeho.root.traverse((o) => { if ((o as THREE.Mesh).isMesh && !o.userData.noShadow) o.castShadow = true; });
scene.add(yeho.root);

const TORSO_Y = 2.7;
const camera = new THREE.PerspectiveCamera(20, innerWidth / innerHeight, 0.1, 200);  // ≈85 mm
/** Distancia según la forma de la pantalla: en vertical (móvil) hay que alejarse
 *  para que la figura quepa a lo ancho; en apaisado se puede acercar. */
function fitDistance(): number {
  const a = innerWidth / innerHeight;
  const vis = 2 * Math.tan((20 * Math.PI / 180) / 2);      // altura visible por unidad de distancia
  const needH = 5.6 / vis;                                  // alto de la figura + margen
  const needW = 3.1 / (vis * Math.max(a, 0.01));            // ancho de la figura + margen
  return Math.min(30, Math.max(9, Math.max(needH, needW)));
}
camera.position.set(0, 2.55, fitDistance());

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true; controls.dampingFactor = 0.08;
controls.target.set(0, 2.15, 0);
controls.minDistance = 8; controls.maxDistance = 30;
controls.maxPolarAngle = Math.PI * 0.52;
controls.update();

const fx = setupPreciousRender(renderer, scene, camera, {
  exposure: 0.92,
  bloom: { strength: 0.08, radius: 0.4, threshold: 1.0 }
});

// --- Presentación automática, con cesión del mando al usuario ---
let spinning = true;          // giro automático
let idleSince = 0;            // desde cuándo no toca nada
const RESUME_AFTER = 4;       // segundos para retomar el giro solo

controls.addEventListener('start', () => { spinning = false; idleSince = 0; hideHint(); });
controls.addEventListener('end', () => { idleSince = 0.0001; });

const hint = document.getElementById('hint');
let hintTimer = setTimeout(() => hideHint(), 6000);
function hideHint(): void { if (hint) hint.style.opacity = '0'; clearTimeout(hintTimer); }

addEventListener('keydown', (e) => {
  const k = e.key.toLowerCase();
  if (e.code === 'Space') { e.preventDefault(); yeho.attack(); hideHint(); }
  else if (k === 'p') { spinning = !spinning; idleSince = 0; hideHint(); }
});
renderer.domElement.addEventListener('pointerdown', hideHint);
// En táctil, un toque corto sin arrastrar hace que salude.
let tapAt = 0, tapX = 0, tapY = 0;
renderer.domElement.addEventListener('pointerdown', (e) => { tapAt = performance.now(); tapX = e.clientX; tapY = e.clientY; });
renderer.domElement.addEventListener('pointerup', (e) => {
  const quick = performance.now() - tapAt < 300;
  const still = Math.hypot(e.clientX - tapX, e.clientY - tapY) < 12;
  if (quick && still) yeho.attack();
});

// El fondo 3D y la sombra siguen al tema del visor, no solo al del sistema.
function applyTheme(): void {
  dark = isDark();
  (scene.background as THREE.Color).set(dark ? 0x14161a : 0xf2f2f4);
  (floor.material as THREE.ShadowMaterial).opacity = dark ? 0.45 : 0.3;
  hemi.intensity = dark ? 0.42 : 0.62;
}
matchMedia('(prefers-color-scheme: dark)').addEventListener('change', applyTheme);
new MutationObserver(applyTheme).observe(document.documentElement, { attributeFilter: ['data-theme'] });

const clock = new THREE.Clock();
function loop(): void {
  requestAnimationFrame(loop);
  const dt = Math.min(clock.getDelta(), 0.05);
  if (spinning) {
    yeho.root.rotation.y += dt * 0.42;
  } else if (idleSince > 0) {
    idleSince += dt;
    if (idleSince > RESUME_AFTER) { spinning = true; idleSince = 0; }
  }
  yeho.update(dt, true, 1);        // siempre caminando: se ve la animación
  controls.update();
  fx.render();
  (window as any).__ready = true;
}
loop();

function onResize(): void {
  renderer.setSize(innerWidth, innerHeight);
  fx.setSize(innerWidth, innerHeight);
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  // Reencuadra si el usuario no ha tomado el mando (giro automático activo).
  if (spinning) {
    const d = fitDistance();
    const dir = camera.position.clone().sub(controls.target).normalize();
    camera.position.copy(controls.target).addScaledVector(dir, d);
    controls.update();
  }
}
addEventListener('resize', onResize);
addEventListener('orientationchange', () => setTimeout(onResize, 250));
