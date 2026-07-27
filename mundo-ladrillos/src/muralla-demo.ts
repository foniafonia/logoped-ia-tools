import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { setupPreciousRender } from './core/PreciousRender';
import { PlasticMaterialFactory } from './materials/PlasticMaterialFactory';
import { addBackdrop } from './world/Backdrop';
import { bgJericoTelon } from './assets/bgJericoTelon';
import { BrickBurstSystem } from './world/BrickBurst';
import { buildProcessionCrowd } from './world/Crowd';

/**
 * muralla-demo — el CLÍMAX: la muralla de Jericó se DESHACE EN LADRILLOS (Regla de
 * oro nº3, sin violencia). Un muro de sillares que colapsa de izquierda a derecha
 * con BrickBurstSystem.wall(), la procesión celebrando delante. Se reinicia solo
 * en bucle para poder verlo. Pieza de fábrica reutilizable por el LEAD.
 */
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(innerWidth, innerHeight); document.body.appendChild(renderer.domElement);
const scene = new THREE.Scene(); addBackdrop(scene, bgJericoTelon, { skyColor: 0xc9a86a });
scene.fog = new THREE.Fog(0xd8c49a, 40, 130);
const plastic = new PlasticMaterialFactory(); plastic.update({ roughness: 0.6, clearcoat: 0.25, envMapIntensity: 0.8 });
const floor = new THREE.Mesh(new THREE.PlaneGeometry(160, 160), new THREE.MeshStandardMaterial({ color: 0xc7a878, roughness: 0.97 }));
floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; scene.add(floor);
const sun = new THREE.DirectionalLight(0xffe6c2, 1.9); sun.position.set(6, 12, 5); sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048); scene.add(sun);
scene.add(new THREE.HemisphereLight(0xffe6bf, 0x6b4a2a, 0.6));

// muro de sillares (adobe) que luego se deshace
const WALL = { x0: -7, x1: 7, z: -6, height: 4.6 };
let wallGroup: THREE.Group;
function buildWall(): THREE.Group {
  const g = new THREE.Group();
  const cols = 22, rows = 8;
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
    const x = WALL.x0 + (WALL.x1 - WALL.x0) * (c / (cols - 1));
    const y = (r + 0.5) * (WALL.height / rows);
    const off = (r % 2) * 0.3;
    const b = new THREE.Mesh(new THREE.BoxGeometry(0.62, WALL.height / rows * 0.92, 0.6),
      plastic.get([0xcaa15e, 0xb07a45, 0xd8c193][(r + c) % 3]));
    b.position.set(x + off, y, WALL.z); b.castShadow = true; b.receiveShadow = true; g.add(b);
  }
  scene.add(g); return g;
}
wallGroup = buildWall();

const crowd = buildProcessionCrowd(scene, plastic, { mode: 'celebration', origin: { x: -9, z: 3 }, rows: 2, perRow: 4, facingYaw: -0.5 });
const bricks = new BrickBurstSystem(scene, plastic);

const camera = new THREE.PerspectiveCamera(52, innerWidth / innerHeight, 0.1, 240); camera.position.set(1.5, 4.2, 12); camera.lookAt(0, 2.6, -5);
const controls = new OrbitControls(camera, renderer.domElement); controls.enableDamping = true; controls.target.set(0, 2.6, -5); controls.update();
const fx = setupPreciousRender(renderer, scene, camera, { preset: 'day' });

let cycle = 0;
function fall(): void {
  if (wallGroup) { scene.remove(wallGroup); wallGroup.traverse((o) => { const m = o as THREE.Mesh; if (m.geometry) m.geometry.dispose(); }); }
  wallGroup = null as unknown as THREE.Group;
  bricks.wall({ x0: WALL.x0, x1: WALL.x1, z: WALL.z, y: 0, height: WALL.height }, { perMeter: 2, rows: 4, sweepSecs: 2.4, lite: true });
}
setTimeout(fall, 900);

const clock = new THREE.Clock();
function loop(): void {
  requestAnimationFrame(loop);
  const dt = Math.min(0.033, clock.getDelta());
  crowd.update(dt); bricks.update(dt); controls.update(); fx.render();
  // reinicia el ciclo cuando acaban los ladrillos
  if (!bricks.busy && !wallGroup) { cycle++; wallGroup = buildWall(); setTimeout(fall, 1200); }
  (window as any).__ready = true;
}
loop();
addEventListener('resize', () => { renderer.setSize(innerWidth, innerHeight); fx.setSize(innerWidth, innerHeight); camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix(); });
