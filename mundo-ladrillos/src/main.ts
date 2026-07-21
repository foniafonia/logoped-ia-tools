import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { makeBrickGeometry } from './bricks/BrickGeometryFactory';
import { STUD_WIDTH, BRICK_HEIGHT } from './bricks/BrickDimensions';
import { PlasticMaterialFactory } from './materials/PlasticMaterialFactory';
import { BrickPalette } from './materials/BrickPalette';

const app = document.getElementById('app')!;

// ---- Renderer (gestión de color + tonemapping cinematográfico) ----
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.setSize(innerWidth, innerHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.02;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
app.appendChild(renderer.domElement);

// ---- Escena + niebla suave (día) ----
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xc8d6e5);
scene.fog = new THREE.Fog(0xc8d6e5, 40, 120);

// Entorno para reflejos del clearcoat (sin cargar archivos)
const pmrem = new THREE.PMREMGenerator(renderer);
scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;

// ---- Cámara ----
const camera = new THREE.PerspectiveCamera(38, innerWidth / innerHeight, 0.1, 500);
camera.position.set(7.5, 5.2, 9.5);

const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 1.0, 0);
controls.enableDamping = true;

// ---- Iluminación de cine ----
const hemi = new THREE.HemisphereLight(0xffffff, 0xb9986a, 0.55);
scene.add(hemi);

const key = new THREE.DirectionalLight(0xfff2df, 2.4);
key.position.set(8, 12, 6);
key.castShadow = true;
key.shadow.mapSize.set(2048, 2048);
key.shadow.camera.near = 1;
key.shadow.camera.far = 60;
key.shadow.camera.left = -18;
key.shadow.camera.right = 18;
key.shadow.camera.top = 18;
key.shadow.camera.bottom = -18;
key.shadow.bias = -0.0002;
key.shadow.normalBias = 0.02;
scene.add(key);

const fill = new THREE.DirectionalLight(0xbcd2ff, 0.5);
fill.position.set(-9, 6, -4);
scene.add(fill);

// ---- Suelo (placa base neutra que recibe sombra) ----
const ground = new THREE.Mesh(
  new THREE.PlaneGeometry(200, 200),
  new THREE.MeshStandardMaterial({ color: 0xd8c79c, roughness: 0.9, metalness: 0 })
);
ground.rotation.x = -Math.PI / 2;
ground.receiveShadow = true;
scene.add(ground);

// ---- Fábrica de materiales de plástico ----
const plastic = new PlasticMaterialFactory();

function addBrick(
  wStuds: number, dStuds: number, colorHex: number,
  x: number, y: number, z: number, kind: 'brick' | 'plate' | 'tile' = 'brick'
): THREE.Mesh {
  const { geometry } = makeBrickGeometry(wStuds, dStuds, kind);
  const mesh = new THREE.Mesh(geometry, plastic.get(colorHex));
  mesh.position.set(x, y, z);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  scene.add(mesh);
  return mesh;
}

// === HÉROE: un ladrillo 2x4 en arenisca cálida, primer plano ===
const hero = addBrick(4, 2, BrickPalette.SAND, 0, 0, 3.2);
hero.rotation.y = -0.28;

// Un par de piezas de color para ver el plástico (rojo, azul, amarillo)
addBrick(2, 2, BrickPalette.RED, -4.2, 0, 3.6);
addBrick(1, 2, BrickPalette.BLUE, 3.4, 0, 4.4);
addBrick(1, 1, BrickPalette.YELLOW, -2.1, 0, 5.0);

// === PARED pequeña de filas alternadas (para ver juntas y ensamblaje) ===
function buildWall(cols: number, rows: number, ox: number, oz: number): void {
  const sand = [BrickPalette.SAND, BrickPalette.WARM_SAND, BrickPalette.DARK_SAND, BrickPalette.TAN];
  for (let r = 0; r < rows; r++) {
    const offset = r % 2 === 0 ? 0 : STUD_WIDTH; // desfase de media pieza (juntas no alineadas)
    for (let c = 0; c < cols; c++) {
      const x = ox + c * 2 * STUD_WIDTH + (r % 2 ? -STUD_WIDTH : 0);
      const y = r * BRICK_HEIGHT;
      const col = sand[(r + c) % sand.length];
      addBrick(2, 2, col, x + offset - STUD_WIDTH, y, oz);
    }
  }
}
buildWall(5, 5, -4, -2.2);

// ---- Bucle ----
addEventListener('resize', () => {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
});

let t = 0;
function animate(): void {
  requestAnimationFrame(animate);
  t += 0.005;
  controls.update();
  renderer.render(scene, camera);
}
animate();

// Señal para las capturas automáticas (headless)
(window as any).__READY__ = true;
