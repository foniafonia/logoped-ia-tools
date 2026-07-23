import * as THREE from 'three';
import { PlasticMaterialFactory } from './materials/PlasticMaterialFactory';
import { createMinifigure, SPY_SKIN } from './characters/MinifigureFactory';

/**
 * MOCKUP (no es el juego): el momento "esconderse tras la ALFOMBRA colgada".
 * Alfombra de kilim con textura + mecido (tela que ondea) + el ninja escondido
 * detrás (bulto + ojos asomando). Es la propuesta de escondite ESPECIAL para el
 * sigilo del min05. Uso: rug-hide.html?state=in  (o ?state=out).
 */
const params = new URLSearchParams(location.search);
const HIDDEN = (params.get('state') ?? 'in') === 'in';

const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
renderer.setPixelRatio(1); renderer.setSize(innerWidth, innerHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace; renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.55; renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.body.appendChild(renderer.domElement);

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x2a2740);
scene.fog = new THREE.Fog(0x2a2740, 40, 120);
const plastic = new PlasticMaterialFactory();

// luz noche cálida (se ve todo)
scene.add(new THREE.HemisphereLight(0x8a90c0, 0x4a4030, 1.5));
scene.add(new THREE.AmbientLight(0x6a6488, 0.5));
const key = new THREE.DirectionalLight(0xffe2b0, 1.5); key.position.set(6, 12, 10); key.castShadow = true;
key.shadow.mapSize.set(1024, 1024); key.shadow.camera.left = -12; key.shadow.camera.right = 12; key.shadow.camera.top = 12; key.shadow.camera.bottom = -6;
scene.add(key);

function box(w: number, h: number, d: number, color: number, x: number, y: number, z: number): THREE.Mesh {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), plastic.get(color)); m.position.set(x, y, z); m.castShadow = true; m.receiveShadow = true; return m;
}

// suelo + pared de arenisca
const floor = new THREE.Mesh(new THREE.PlaneGeometry(80, 80), new THREE.MeshStandardMaterial({ color: 0x6a5f52, roughness: 1 }));
floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; scene.add(floor);
const wall = box(30, 20, 1.2, 0xdcc596, 0, 10, -3); scene.add(wall);
for (let x = -14; x <= 14; x += 3) scene.add(box(1.6, 1.6, 1.4, 0xc4a878, x, 20.2, -3)); // almenas
// arco/ventana cálida al lado
scene.add(box(2.4, 3, 0.4, 0x241a10, 7.5, 3, -2.35));
const winGlow = new THREE.Mesh(new THREE.BoxGeometry(1.7, 2.2, 0.12), new THREE.MeshBasicMaterial({ color: 0xffcb7a })); winGlow.position.set(7.5, 3, -2.2); scene.add(winGlow);

// farol cálido que ilumina la alfombra
scene.add(box(0.5, 0.7, 0.5, 0x3a2a18, -6.4, 6.4, -2.2));
scene.add(new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.44, 0.3), new THREE.MeshBasicMaterial({ color: 0xffb24d })).translateX(-6.4).translateY(6.4).translateZ(-2.1));
const lamp = new THREE.PointLight(0xffb45a, 7, 26, 2); lamp.position.set(-6.4, 6.2, -1.6); scene.add(lamp);
const warm = new THREE.SpotLight(0xffd9a0, 3.2, 30, 0.7, 0.5); warm.position.set(-3, 12, 6); warm.target.position.set(-1, 5, -2.4); scene.add(warm, warm.target);

// ---------- ALFOMBRA de KILIM (textura tejida) ----------
function kilim(): THREE.Texture {
  const c = document.createElement('canvas'); c.width = 256; c.height = 384; const x = c.getContext('2d')!;
  x.fillStyle = '#e7d3a6'; x.fillRect(0, 0, 256, 384);
  // bordes en zigzag
  const border = (col: string, inset: number, w: number) => { x.strokeStyle = col; x.lineWidth = w; x.strokeRect(inset, inset, 256 - inset * 2, 384 - inset * 2); };
  border('#9c3b2a', 10, 14); border('#caa14a', 26, 6); border('#2f6b5a', 36, 5);
  // campo con rombos
  for (let ry = 60; ry < 330; ry += 46) for (let rx = 46; rx < 220; rx += 46) {
    x.fillStyle = ((rx + ry) % 92 === 0) ? '#9c3b2a' : '#2f6b5a';
    x.beginPath(); x.moveTo(rx, ry - 16); x.lineTo(rx + 16, ry); x.lineTo(rx, ry + 16); x.lineTo(rx - 16, ry); x.closePath(); x.fill();
    x.fillStyle = '#caa14a'; x.fillRect(rx - 3, ry - 3, 6, 6);
  }
  // medallón central
  x.fillStyle = '#9c3b2a'; x.beginPath(); x.moveTo(128, 150); x.lineTo(180, 192); x.lineTo(128, 234); x.lineTo(76, 192); x.closePath(); x.fill();
  x.fillStyle = '#e7d3a6'; x.beginPath(); x.moveTo(128, 168); x.lineTo(160, 192); x.lineTo(128, 216); x.lineTo(96, 192); x.closePath(); x.fill();
  // flecos
  x.strokeStyle = '#b89b62'; x.lineWidth = 3; for (let fx = 12; fx < 256; fx += 8) { x.beginPath(); x.moveTo(fx, 372); x.lineTo(fx, 384); x.stroke(); }
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}
const rugMat = new THREE.MeshStandardMaterial({ map: kilim(), roughness: 0.95, side: THREE.DoubleSide });
const RW = 5.2, RH = 7.4;
const rugGeo = new THREE.PlaneGeometry(RW, RH, 16, 22);
const rugBase = rugGeo.attributes.position.clone();
const rug = new THREE.Mesh(rugGeo, rugMat); rug.position.set(-1, 5.2, -2.35); rug.castShadow = true; scene.add(rug);
// barra de la que cuelga
const rod = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.14, RW + 0.8, 8), plastic.get(0x6e4a2c));
rod.rotation.z = Math.PI / 2; rod.position.set(-1, 8.95, -2.2); rod.castShadow = true; scene.add(rod);

// ---------- NINJA ----------
const spy = createMinifigure(plastic, SPY_SKIN);
if (HIDDEN) { spy.root.position.set(-1.2, 0, -2.75); spy.root.rotation.y = 0; }   // detrás de la alfombra
else { spy.root.position.set(3.2, 0, 1.2); spy.root.rotation.y = -0.7; }          // acercándose
scene.add(spy.root);

// manita amarilla agarrando el borde de la alfombra (detalle simpático)
if (HIDDEN) {
  const hand = box(0.34, 0.2, 0.12, 0xf4d03f, -3.55, 5.6, -2.0); hand.rotation.z = 0.2; scene.add(hand);
}

(document.getElementById('tag')!).textContent = HIDDEN ? 'ESCONDIDO tras la alfombra (bulto + ojos asomando)' : 'Acercándose a la alfombra';

// ---------- cámara ----------
const camera = new THREE.PerspectiveCamera(46, innerWidth / innerHeight, 0.1, 300);
camera.position.set(4.5, 6.2, 12); camera.lookAt(-1, 5, -2);

let t = HIDDEN ? 0.6 : 0;
function applyRug(): void {
  const p = rugGeo.attributes.position; const b = rugBase;
  for (let i = 0; i < p.count; i++) {
    const bx = b.getX(i), by = b.getY(i);
    const droop = (RH / 2 - by) / RH; // 0 arriba (fija a la barra) .. 1 abajo
    // ondeo suave de tela: 0 arriba (cuelga de la barra), crece hacia el bajo
    const swayAmp = HIDDEN ? 0.05 : 0.08;
    let z = swayAmp * droop * droop * Math.sin(bx * 0.7 + t * 1.6);
    if (HIDDEN) {
      // BULTO del cuerpo (alguien empuja la tela hacia fuera) + bulto de la cabeza
      const body = Math.exp(-((bx + 0.2) ** 2) / 1.7 - ((by + 0.6) ** 2) / 4.0) * 1.9;
      const head = Math.exp(-((bx + 0.2) ** 2) / 0.7 - ((by - 1.6) ** 2) / 1.1) * 1.1;
      const b = body + head;
      z += b + Math.sin(t * 3) * 0.06 * b; // el bulto "respira"
    }
    p.setZ(i, z);
  }
  p.needsUpdate = true; rugGeo.computeVertexNormals();
}
function loop(): void {
  requestAnimationFrame(loop);
  t += 0.016; applyRug(); spy.update(0.016, false);
  renderer.render(scene, camera);
  (window as any).__ready = true;
}
loop();
addEventListener('resize', () => { renderer.setSize(innerWidth, innerHeight); camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix(); });
