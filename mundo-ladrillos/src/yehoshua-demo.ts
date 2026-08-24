import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { setupPreciousRender } from './core/PreciousRender';
import { PlasticMaterialFactory } from './materials/PlasticMaterialFactory';
import { createMinifigure, YOSHUA_SKIN } from './characters/MinifigureFactory';

/**
 * ESTUDIO DE FIDELIDAD — Yehoshúa.
 * Un espacio vacío (fondo blanco, luz de estudio uniforme, cámara a la altura del
 * torso, sombra de contacto muy tenue) tal como pide la hoja de personaje oficial,
 * para inspeccionar al Yehoshúa reconstruido desde todos los ángulos y medir
 * cuánto se parece al de la película. Sin escenografía a propósito: aquí solo
 * importa el personaje.
 */

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(innerWidth, innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.body.appendChild(renderer.domElement);

const scene = new THREE.Scene();
const BG_LIGHT = new THREE.Color(0xffffff);   // fondo blanco puro (hoja oficial)
const BG_DARK = new THREE.Color(0x1d1f24);    // alternativa para juzgar siluetas
scene.background = BG_LIGHT.clone();

// Plástico limpio con reflejos suaves y bordes redondeados (look de juguete).
const plastic = new PlasticMaterialFactory();
plastic.update({ roughness: 0.32, clearcoat: 0.55, envMapIntensity: 1.15 });

// Suelo blanco que solo recoge una sombra de contacto muy tenue.
const floor = new THREE.Mesh(
  new THREE.PlaneGeometry(80, 80),
  new THREE.ShadowMaterial({ opacity: 0.12 })   // invisible salvo la sombra
);
floor.rotation.x = -Math.PI / 2;
floor.receiveShadow = true;
scene.add(floor);

// Iluminación de estudio BLANCA y uniforme (poco contraste, sin tinte cálido).
scene.add(new THREE.HemisphereLight(0xffffff, 0xdedede, 1.15));
const fill = new THREE.DirectionalLight(0xffffff, 0.9);
fill.position.set(-6, 5, 6); scene.add(fill);
const rim = new THREE.DirectionalLight(0xffffff, 0.6);
rim.position.set(6, 4, -5); scene.add(rim);
// Cenital tenue: la única que proyecta la sombra de contacto suave.
const key = new THREE.DirectionalLight(0xffffff, 0.7);
key.position.set(0.5, 12, 3.5);
key.castShadow = true;
key.shadow.mapSize.set(2048, 2048);
key.shadow.camera.near = 1; key.shadow.camera.far = 30;
key.shadow.camera.left = -6; key.shadow.camera.right = 6;
key.shadow.camera.top = 6; key.shadow.camera.bottom = -6;
key.shadow.radius = 6;             // penumbra amplia = sombra muy suave
key.shadow.bias = -0.0005;
scene.add(key);

// El personaje canónico, centrado en el origen.
const yeho = createMinifigure(plastic, YOSHUA_SKIN);
yeho.root.traverse((o) => { if ((o as THREE.Mesh).isMesh) { o.castShadow = true; } });
scene.add(yeho.root);

// Altura aproximada de la minifigura ≈ 5.15; torso ≈ 2.8.
const TORSO_Y = 2.8;
const camera = new THREE.PerspectiveCamera(38, innerWidth / innerHeight, 0.1, 200);
const HOME = new THREE.Vector3(0, TORSO_Y, 11);
camera.position.copy(HOME);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.08;
controls.target.set(0, TORSO_Y - 0.3, 0);   // encuadra el personaje completo
controls.minDistance = 6;
controls.maxDistance = 20;
controls.maxPolarAngle = Math.PI * 0.52;     // no bajar bajo el suelo
controls.update();

const fx = setupPreciousRender(renderer, scene, camera, {
  exposure: 1.0,
  bloom: { strength: 0.08, radius: 0.4, threshold: 1.0 }   // casi sin bloom: fondo blanco limpio
});

// --- Interacción ---
let turntable = false;      // giro de turnaround (tecla G)
let dark = false;           // fondo claro/oscuro (tecla F)
addEventListener('keydown', (e) => {
  const k = e.key.toLowerCase();
  if (k === 'g') turntable = !turntable;
  else if (k === 'r') { camera.position.copy(HOME); controls.target.set(0, TORSO_Y - 0.3, 0); controls.update(); }
  else if (k === 'f') { dark = !dark; scene.background = (dark ? BG_DARK : BG_LIGHT).clone(); }
});

const clock = new THREE.Clock();
function loop(): void {
  requestAnimationFrame(loop);
  const dt = Math.min(clock.getDelta(), 0.05);
  if (turntable) yeho.root.rotation.y += dt * 0.5;   // vuelta lenta para el turnaround
  yeho.update(dt, false);                            // respiración/idle sutil, quieto
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
