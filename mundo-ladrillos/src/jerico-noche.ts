import * as THREE from 'three';
import { PlasticMaterialFactory } from './materials/PlasticMaterialFactory';
import { createMinifigure, SPY_SKIN, GUARD_SKIN } from './characters/MinifigureFactory';

/**
 * MOCKUP (no es el juego): escena estrella "Jericó de noche" reconstruida EN
 * BLOQUES, fiel al fotograma (arenisca, arcos, faroles cálidos, luna, el
 * "Restaurante de Rahab", cobblestones). Sirve de vara de medir visual para
 * las escenas 15-16 del min05. Uso: jerico-noche.html
 */

const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
renderer.setPixelRatio(1);
renderer.setSize(innerWidth, innerHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.4;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.body.appendChild(renderer.domElement);

const scene = new THREE.Scene();
const plastic = new PlasticMaterialFactory();

const SAND = 0xcdb082, SAND_D = 0xb2966a, SAND_L = 0xdcc596, STONE = 0x413a34;

// ---------- CIELO NOCHE + niebla + luna ----------
function nightSky(): THREE.Texture {
  const c = document.createElement('canvas'); c.width = 16; c.height = 256;
  const ctx = c.getContext('2d')!;
  const g = ctx.createLinearGradient(0, 0, 0, 256);
  g.addColorStop(0.0, '#070f24'); g.addColorStop(0.5, '#122043'); g.addColorStop(0.82, '#28345a'); g.addColorStop(1.0, '#4a4a5e');
  ctx.fillStyle = g; ctx.fillRect(0, 0, 16, 256);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}
scene.background = nightSky();
scene.fog = new THREE.Fog(0x1b2748, 45, 180);

// luna
const moon = new THREE.Mesh(new THREE.SphereGeometry(6, 24, 16), new THREE.MeshBasicMaterial({ color: 0xf6f1dc }));
moon.position.set(-46, 60, -120); scene.add(moon);
// estrellas
const starGeo = new THREE.BufferGeometry();
const sp: number[] = [];
for (let i = 0; i < 140; i++) sp.push((i * 53 % 400) - 200, 40 + (i * 31 % 80), -140 - (i * 17 % 60));
starGeo.setAttribute('position', new THREE.Float32BufferAttribute(sp, 3));
scene.add(new THREE.Points(starGeo, new THREE.PointsMaterial({ color: 0xdfe6ff, size: 0.7, sizeAttenuation: true })));

// ---------- LUCES (noche fría + faroles cálidos) ----------
scene.add(new THREE.HemisphereLight(0x5a6c9a, 0x1c1710, 1.05));
const moonLight = new THREE.DirectionalLight(0xbcccff, 1.15);
moonLight.position.set(-40, 55, -20); moonLight.castShadow = true;
moonLight.shadow.mapSize.set(1024, 1024);
moonLight.shadow.camera.near = 1; moonLight.shadow.camera.far = 160;
moonLight.shadow.camera.left = -50; moonLight.shadow.camera.right = 50; moonLight.shadow.camera.top = 50; moonLight.shadow.camera.bottom = -20;
scene.add(moonLight);

// ---------- helpers ----------
function box(w: number, h: number, d: number, color: number, x: number, y: number, z: number): THREE.Mesh {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), plastic.get(color));
  m.position.set(x, y, z); m.castShadow = true; m.receiveShadow = true; return m;
}
function glow(w: number, h: number, d: number, color: number, x: number, y: number, z: number): THREE.Mesh {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), new THREE.MeshBasicMaterial({ color }));
  m.position.set(x, y, z); return m;
}
const lanternPositions: THREE.Vector3[] = [];
function lantern(x: number, y: number, z: number): void {
  scene.add(box(0.4, 0.6, 0.4, 0x3a2a18, x, y, z));       // caja del farol
  scene.add(glow(0.26, 0.4, 0.26, 0xffb24d, x, y, z));    // llama
  lanternPositions.push(new THREE.Vector3(x, y, z));
}

// ---------- SUELO empedrado ----------
const ground = new THREE.Mesh(new THREE.PlaneGeometry(300, 300), new THREE.MeshStandardMaterial({ color: STONE, roughness: 1 }));
ground.rotation.x = -Math.PI / 2; ground.receiveShadow = true; scene.add(ground);
// baldosas sueltas para textura
for (let i = 0; i < 60; i++) {
  const gx = (i * 37 % 40) - 20, gz = 18 - (i * 23 % 60);
  const t = box(2.4, 0.12, 2.4, (i % 3 === 0) ? 0x4a4038 : 0x37302a, gx, 0.06, gz); t.castShadow = false; scene.add(t);
}

// ---------- EDIFICIO de arenisca (fachada + arco + ventana + parapeto) ----------
function building(x: number, z: number, w: number, h: number, d: number, litDoor = false): void {
  const g = new THREE.Group();
  g.add(box(w, h, d, SAND, 0, h / 2, 0));                          // cuerpo
  // parapeto/almenas en el techo
  for (let bx = -w / 2 + 0.6; bx <= w / 2 - 0.6; bx += 1.5) g.add(box(0.9, 0.9, d + 0.1, SAND_D, bx, h + 0.4, 0));
  // franja de zócalo
  g.add(box(w + 0.1, 0.5, d + 0.1, SAND_D, 0, 0.25, 0));
  // puerta con arco (recova oscura + medio cilindro arriba)
  const door = box(1.7, 2.4, 0.3, litDoor ? 0x3a2a16 : 0x241a10, 0, 1.3, d / 2 + 0.02); g.add(door);
  const arch = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 0.9, 0.32, 14, 1, false, 0, Math.PI), plastic.get(SAND_L));
  arch.rotation.z = Math.PI; arch.rotation.x = Math.PI / 2; arch.position.set(0, 2.5, d / 2 + 0.02); arch.castShadow = true; g.add(arch);
  if (litDoor) { g.add(glow(1.5, 2.0, 0.12, 0xffb56b, 0, 1.2, d / 2 + 0.12)); }  // luz cálida que sale
  // ventanas iluminadas
  for (const wx of [-w / 2 + 1.4, w / 2 - 1.4]) {
    g.add(box(1.0, 1.0, 0.28, SAND_D, wx, h * 0.62, d / 2 + 0.02));
    g.add(glow(0.66, 0.66, 0.12, 0xffcb7a, wx, h * 0.62, d / 2 + 0.12));
  }
  g.position.set(x, 0, z); scene.add(g);
}

// Calle: edificios a izquierda y derecha, de cerca (z+) a lejos (z-)
const rows: Array<[number, number, number, number, boolean]> = [
  [-13, 12, 8, 6.5, false], [-14, 2, 9, 8, false], [-13, -9, 8, 5.5, false], [-14, -19, 9, 7, false],
  [13, 12, 8, 6, false], [14, 1, 9, 7.5, true], [13, -10, 8, 6.5, false], [14, -20, 9, 8, false]
];
for (const [x, z, w, h, lit] of rows) building(x, z, w, h, 8, lit);

// faroles de pared por la calle (dan los charcos de luz cálidos)
lantern(-9, 3.4, 12); lantern(9.2, 3.6, 6); lantern(-9.2, 3.2, -9); lantern(9.4, 3.8, -18); lantern(-9, 3.4, -19);
for (const lp of lanternPositions) {
  const pl = new THREE.PointLight(0xffa64d, 6, 20, 2); pl.position.copy(lp).add(new THREE.Vector3(0, -0.1, 0)); scene.add(pl);
}

// ---------- "RESTAURANTE DE RAHAB" (estandarte tejido colgado) ----------
function bannerTexture(): THREE.Texture {
  const c = document.createElement('canvas'); c.width = 256; c.height = 320; const x = c.getContext('2d')!;
  x.fillStyle = '#efe2c4'; x.fillRect(0, 0, 256, 320);
  x.strokeStyle = '#8a3320'; x.lineWidth = 10; x.strokeRect(14, 14, 228, 292);
  x.fillStyle = '#8a3320';
  for (let i = 0; i < 6; i++) { x.beginPath(); x.moveTo(30 + i * 38, 250); x.lineTo(49 + i * 38, 285); x.lineTo(11 + i * 38, 285); x.closePath(); x.fill(); }
  x.fillStyle = '#5a3320'; x.font = 'bold 30px Georgia,serif'; x.textAlign = 'center';
  x.fillText('RESTAURANTE', 128, 90); x.fillText('DE RAHAB', 128, 130);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}
const banner = new THREE.Mesh(new THREE.BoxGeometry(2.6, 3.2, 0.16), new THREE.MeshStandardMaterial({ map: bannerTexture(), roughness: 0.9 }));
banner.position.set(9.0, 4.6, 5.2); banner.castShadow = true; scene.add(banner);
// farol junto al letrero
lantern(11.0, 4.0, 5.4);
scene.add(new THREE.PointLight(0xffb24d, 5, 14, 2).translateX(11).translateY(4).translateZ(5.4));

// ---------- props: barriles, macetas, palmera ----------
function barrel(x: number, z: number): void {
  const b = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.55, 1.3, 12), plastic.get(0x6e4a2c));
  b.position.set(x, 0.65, z); b.castShadow = true; scene.add(b);
}
function pot(x: number, z: number): void {
  scene.add(new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.35, 0.8, 10), plastic.get(0xb5673a)).translateX(x).translateY(0.4).translateZ(z));
  for (let k = 0; k < 4; k++) { const l = box(0.3, 0.9, 0.14, 0x3f7a46, x + (k - 1.5) * 0.14, 1.1, z); l.rotation.z = (k - 1.5) * 0.3; scene.add(l); }
}
barrel(7.6, 9); barrel(8.4, 8.2); barrel(-7.6, -6); pot(6.6, 5.6); pot(-7.2, 10);
// palmera de encuadre
function palm(x: number, z: number): void {
  for (let k = 0; k < 5; k++) scene.add(box(0.5, 1.6, 0.5, 0x6e4a2c, x, 0.8 + k * 1.5, z));
  for (let f = 0; f < 5; f++) { const fr = box(4.4, 0.4, 1.2, 0x2f6b3d, x, 8.2, z); fr.rotation.y = (f / 5) * Math.PI * 2; fr.rotation.z = 0.4; fr.position.x = x + Math.cos(fr.rotation.y) * 2; fr.position.z = z + Math.sin(fr.rotation.y) * 2; scene.add(fr); }
}
palm(-11, 13);

// ---------- muralla + puerta al fondo de la calle ----------
const wall = box(70, 20, 5, SAND, 0, 10, -34); scene.add(wall);
for (let x = -33; x <= 33; x += 4.5) scene.add(box(2.6, 2.4, 5.2, SAND_D, x, 21, -34));
for (const tx of [-22, 22]) { scene.add(box(9, 27, 9, SAND, tx, 13.5, -33)); }
scene.add(box(6, 8, 1, 0x2a1c10, 0, 4, -31.5));          // puerta
scene.add(glow(5, 6.5, 0.2, 0xff9d4d, 0, 3.6, -31.2));   // resplandor bajo el arco de la puerta
scene.add(new THREE.PointLight(0xffa64d, 8, 26, 2).translateY(4).translateZ(-30));

// ---------- personajes: espía (sigilo) + guardia con farol ----------
const spy = createMinifigure(plastic, SPY_SKIN);
spy.root.position.set(-2.5, 0, 8); spy.root.rotation.y = 0.3; scene.add(spy.root);
const guard = createMinifigure(plastic, GUARD_SKIN);
guard.root.position.set(4, 0, -6); guard.root.rotation.y = Math.PI - 0.3; guard.root.scale.setScalar(1.0); scene.add(guard.root);

// ---------- cámara ----------
const camera = new THREE.PerspectiveCamera(52, innerWidth / innerHeight, 0.1, 400);
camera.position.set(3.5, 6.2, 24); camera.lookAt(0, 4.5, -20);

let t = 0;
function loop(): void {
  requestAnimationFrame(loop);
  t += 0.016; spy.update(0.016, false); guard.update(0.016, false);
  renderer.render(scene, camera);
  (window as any).__ready = true;
}
loop();
addEventListener('resize', () => { renderer.setSize(innerWidth, innerHeight); camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix(); });
