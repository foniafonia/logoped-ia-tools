import * as THREE from 'three';
import { PlasticMaterialFactory } from './materials/PlasticMaterialFactory';
import { createMinifigure, CHARACTER_SKINS } from './characters/MinifigureFactory';

/**
 * Harness de PREVIEW (no forma parte del juego): renderiza un único muñeco
 * de frente sobre fondo neutro para sacar capturas y comparar con la peli.
 * Uso: preview.html?fig=espia  (ver claves en CHARACTER_SKINS).
 */

const LABELS: Record<string, string> = {
  espia: 'Espía',
  espia2: 'Segundo espía',
  espiaCamp: 'Espía · campamento',
  espia2Camp: 'Espía 2 · campamento',
  yehoshua: 'Yehoshúa',
  rahab: 'Rahab',
  guardia: 'Guardia de Jericó',
  jefeGuardia: 'Jefe de guardia',
  sacerdote: 'Sacerdote (Cohen)',
  beduino: 'Beduino',
  rabino: 'Rabino director'
};

const params = new URLSearchParams(location.search);
const fig = params.get('fig') ?? 'espia';
const base = CHARACTER_SKINS[fig] ?? CHARACTER_SKINS.espia;

// Overrides por URL para renderizar OFERTAS/variantes sin tocar las skins
// del juego. Ej: ?fig=rahab&headwear=0xdfe3e8&torso=0xcdb79a
const skin: Record<string, unknown> = { ...base };
for (const k of ['head', 'torso', 'belt', 'legs', 'arms', 'hands', 'headwear', 'beard', 'skirt', 'lips']) {
  const v = params.get(k);
  if (v) skin[k] = Number(v); // acepta 0xRRGGBB o decimal
}
for (const k of ['feminine', 'skirtLong']) {
  if (params.get(k) === '1') skin[k] = true;
}
// Override de emoción para probar el set de caras: ?emotion=surprised
const emo = params.get('emotion');
if (emo) skin.emotion = emo;

const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
renderer.setPixelRatio(1);
renderer.setSize(innerWidth, innerHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.1;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.body.appendChild(renderer.domElement);

const scene = new THREE.Scene();
scene.background = new THREE.Color(0xe9e4d6);

const camera = new THREE.PerspectiveCamera(32, innerWidth / innerHeight, 0.1, 100);
camera.position.set(0, 2.4, 15);
camera.lookAt(0, 2.4, 0);

// Luz de estudio suave, cálida y frontal (para juzgar cara y colores)
scene.add(new THREE.HemisphereLight(0xffffff, 0x9a8f78, 1.5));
const key = new THREE.DirectionalLight(0xfff2dc, 2.4);
key.position.set(4, 8, 8); key.castShadow = true;
key.shadow.mapSize.set(1024, 1024);
key.shadow.camera.near = 1; key.shadow.camera.far = 40;
key.shadow.camera.left = -8; key.shadow.camera.right = 8;
key.shadow.camera.top = 10; key.shadow.camera.bottom = -2;
scene.add(key);
const fill = new THREE.DirectionalLight(0xd8e4ff, 0.8);
fill.position.set(-6, 4, 6);
scene.add(fill);

// Suelo con leve sombra
const floor = new THREE.Mesh(
  new THREE.CircleGeometry(8, 48),
  new THREE.MeshStandardMaterial({ color: 0xd9d2c0, roughness: 0.95 })
);
floor.rotation.x = -Math.PI / 2;
floor.receiveShadow = true;
scene.add(floor);

const plastic = new PlasticMaterialFactory();
const fighter = createMinifigure(plastic, skin);
scene.add(fighter.root);

const labelEl = document.getElementById('label')!;
labelEl.textContent = LABELS[fig] ?? fig;

// Giro lento opcional con ?spin=1; por defecto, quieto de frente.
const spin = params.get('spin') === '1';
let t = 0;
function loop(): void {
  requestAnimationFrame(loop);
  t += 0.016;
  if (spin) fighter.root.rotation.y = Math.sin(t * 0.5) * 0.5;
  fighter.update(0.016, false);
  renderer.render(scene, camera);
  (window as any).__ready = true;
}
loop();

addEventListener('resize', () => {
  renderer.setSize(innerWidth, innerHeight);
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
});
