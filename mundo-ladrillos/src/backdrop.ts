import * as THREE from 'three';
import { PlasticMaterialFactory } from './materials/PlasticMaterialFactory';
import { createMinifigure, SPY_SKIN } from './characters/MinifigureFactory';

/**
 * MOCKUP (no es el juego): compara un escenario "VACÍO" (suelo plano + fondo
 * liso, como se ven ahora algunas escenas) con uno de "MUNDO LLENO" (cielo con
 * color, montañas, dunas y la fortaleza de Jericó al fondo). Uso: backdrop.html?full=1
 */

const params = new URLSearchParams(location.search);
const FULL = params.get('full') !== '0';

const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
renderer.setPixelRatio(1);
renderer.setSize(innerWidth, innerHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.12;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.body.appendChild(renderer.domElement);

const scene = new THREE.Scene();
const plastic = new PlasticMaterialFactory();

// ---------- CIELO ----------
function skyTexture(): THREE.Texture {
  const c = document.createElement('canvas'); c.width = 16; c.height = 256;
  const g = c.getContext('2d')!.createLinearGradient(0, 0, 0, 256);
  g.addColorStop(0.0, '#20365f');   // cénit azul noche-atardecer
  g.addColorStop(0.45, '#6b6a86');
  g.addColorStop(0.72, '#e6a463');   // franja cálida del horizonte
  g.addColorStop(1.0, '#f2cf9a');
  const ctx = c.getContext('2d')!; ctx.fillStyle = g; ctx.fillRect(0, 0, 16, 256);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}
const HORIZON = 0xe0a86a;

if (FULL) {
  scene.background = skyTexture();
  scene.fog = new THREE.Fog(HORIZON, 55, 280); // da PROFUNDIDAD y funde lo lejano
} else {
  scene.background = new THREE.Color(0xe9e4d6);  // el "vacío" liso de ahora
}

// ---------- LUZ ----------
scene.add(new THREE.HemisphereLight(FULL ? 0xffdca8 : 0xffffff, 0x6b5a44, FULL ? 1.15 : 1.5));
const sun = new THREE.DirectionalLight(FULL ? 0xffd39a : 0xfff2dc, FULL ? 2.6 : 2.2);
sun.position.set(-40, 34, -20); sun.castShadow = true;
sun.shadow.mapSize.set(1024, 1024);
sun.shadow.camera.near = 1; sun.shadow.camera.far = 160;
sun.shadow.camera.left = -40; sun.shadow.camera.right = 40; sun.shadow.camera.top = 40; sun.shadow.camera.bottom = -20;
scene.add(sun);

// ---------- SUELO (dunas suaves) ----------
const ground = new THREE.Mesh(
  new THREE.PlaneGeometry(600, 600),
  new THREE.MeshStandardMaterial({ color: FULL ? 0xdcc390 : 0xd9d2c0, roughness: 1 })
);
ground.rotation.x = -Math.PI / 2; ground.receiveShadow = true; scene.add(ground);

// Grupo del "mundo lleno" (todo lo que se OCULTA en el modo vacío)
const world = new THREE.Group();
world.visible = FULL;
scene.add(world);

function mesh(g: THREE.BufferGeometry, color: number, x: number, y: number, z: number): THREE.Mesh {
  const m = new THREE.Mesh(g, plastic.get(color)); m.position.set(x, y, z); m.castShadow = true; m.receiveShadow = true; return m;
}

// Dunas: montículos bajos y anchos repartidos
const duneColors = [0xd8bd86, 0xe0c793, 0xcdb078];
const dunePos: Array<[number, number, number, number]> = [
  [-26, -30, 9, 0], [30, -46, 12, 1], [-44, -70, 16, 2], [48, -80, 18, 0], [10, -110, 24, 1], [-70, -120, 28, 2]
];
for (const [x, z, r, ci] of dunePos) {
  const d = mesh(new THREE.SphereGeometry(r, 12, 8), duneColors[ci], x, -r * 0.86, z);
  d.scale.set(1, 0.32, 1); world.add(d);
}

// Cerros lejanos: MESETAS de cima plana + colinas redondeadas (arenisca),
// como el desierto de la peli (NO pirámides egipcias).
const mtnColors = [0xc9b183, 0xbaa274, 0xd0ba8c, 0xa9906a];
for (let i = 0; i < 12; i++) {
  const ang = -Math.PI * 0.94 + (i / 11) * Math.PI * 0.88;
  const rad = 190 + (i % 3) * 30;
  const h = 40 + (i % 4) * 18;
  const x = Math.cos(ang) * rad, z = -Math.abs(Math.sin(ang)) * rad - 40;
  const col = mtnColors[i % 4];
  if (i % 2 === 0) {
    // meseta (butte): cilindro ancho de cima plana, ligeramente troncocónico
    const m = mesh(new THREE.CylinderGeometry(h * 0.62, h * 0.9, h, 7), col, x, h / 2 - 6, z);
    m.rotation.y = i; world.add(m);
    m.add(mesh(new THREE.CylinderGeometry(h * 0.5, h * 0.62, h * 0.28, 7), col, 0, h * 0.6, 0)); // escalón superior
  } else {
    // colina redondeada (media esfera achatada)
    const m = mesh(new THREE.SphereGeometry(h * 0.85, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2), col, x, -4, z);
    m.scale.set(1, 0.6, 1); world.add(m);
  }
}

// ---------- FORTALEZA DE JERICÓ al fondo (silueta de muralla + torres) ----------
const SAND = 0xdcc08a, SAND_D = 0xc2a56f;
const jericho = new THREE.Group();
jericho.position.set(6, 0, -140);
const wallLen = 120, wallH = 22;
const wall = mesh(new THREE.BoxGeometry(wallLen, wallH, 6), SAND, 0, wallH / 2, 0); jericho.add(wall);
// almenas
for (let x = -wallLen / 2 + 3; x <= wallLen / 2 - 3; x += 7) jericho.add(mesh(new THREE.BoxGeometry(4, 4, 6.4), SAND_D, x, wallH + 1.6, 0));
// torres
for (const tx of [-wallLen / 2, -18, 20, wallLen / 2]) {
  const th = wallH + 12;
  jericho.add(mesh(new THREE.BoxGeometry(14, th, 14), SAND, tx, th / 2, 1));
  for (let a = -5; a <= 5; a += 5) jericho.add(mesh(new THREE.BoxGeometry(3.4, 4, 3.4), SAND_D, tx + a, th + 1.8, 1 + a * 0.0));
}
// puerta
jericho.add(mesh(new THREE.BoxGeometry(12, 15, 3), 0x5a3f22, 0, 7.5, 3.2));
world.add(jericho);

// ---------- palmeras de encuadre (cerca) ----------
function palm(x: number, z: number, s = 1): void {
  const g = new THREE.Group();
  for (let k = 0; k < 6; k++) g.add(mesh(new THREE.CylinderGeometry(0.5, 0.6, 2, 6), 0x7a5a34, 0, 1 + k * 1.7, 0));
  for (let f = 0; f < 5; f++) {
    const fr = mesh(new THREE.BoxGeometry(6, 0.5, 1.6), 0x3f7a46, 0, 11, 0);
    fr.rotation.y = (f / 5) * Math.PI * 2; fr.rotation.z = 0.35; fr.position.set(Math.cos(fr.rotation.y) * 2.6, 10.6, Math.sin(fr.rotation.y) * 2.6);
    g.add(fr);
  }
  g.position.set(x, 0, z); g.scale.setScalar(s); world.add(g);
}
palm(-16, -6, 1.1); palm(20, -14, 1.3); palm(34, 4, 0.9);

// ---------- personaje (escala) ----------
const spy = createMinifigure(plastic, SPY_SKIN);
spy.root.position.set(-2, 0, 4); spy.root.scale.setScalar(1.1); spy.root.rotation.y = 0.5;
scene.add(spy.root);

// ---------- cámara ----------
const camera = new THREE.PerspectiveCamera(50, innerWidth / innerHeight, 0.1, 600);
camera.position.set(6, 6.5, 24); camera.lookAt(0, 5, -60);

(document.getElementById('tag')!).textContent = FULL ? 'MUNDO LLENO (con horizonte)' : 'VACÍO (como ahora)';
(document.getElementById('tag')!).style.color = FULL ? '#fff' : '#5a4a34';

let t = 0;
function loop(): void {
  requestAnimationFrame(loop);
  t += 0.016; spy.update(0.016, false);
  renderer.render(scene, camera);
  (window as any).__ready = true;
}
loop();
addEventListener('resize', () => { renderer.setSize(innerWidth, innerHeight); camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix(); });
