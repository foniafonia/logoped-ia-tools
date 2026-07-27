import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { setupPreciousRender } from './core/PreciousRender';
import { PlasticMaterialFactory } from './materials/PlasticMaterialFactory';
import { addBackdrop } from './world/Backdrop';
import { bgJericoMurallas } from './assets/bgJericoMurallas';
import { buildProcessionCrowd } from './world/Crowd';

/**
 * procesion-demo — la multitud de PROCESIÓN (buildProcessionCrowd) para los
 * momentos "wow": a la izquierda la MARCHA (caras resueltas avanzando hacia la
 * muralla), a la derecha la CELEBRACIÓN (júbilo/asombro cuando cae). Filas que
 * miran a un objetivo común, no corrillos. Reutiliza el telón de Jericó.
 */
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(innerWidth, innerHeight); document.body.appendChild(renderer.domElement);
const scene = new THREE.Scene(); addBackdrop(scene, bgJericoMurallas, { skyColor: 0xc9b48a });
scene.fog = new THREE.Fog(0xd8c49a, 40, 120);
const plastic = new PlasticMaterialFactory(); plastic.update({ roughness: 0.5, clearcoat: 0.3, envMapIntensity: 0.8 });
const floor = new THREE.Mesh(new THREE.PlaneGeometry(160, 160), new THREE.MeshStandardMaterial({ color: 0xc7a878, roughness: 0.97 }));
floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; scene.add(floor);
const sun = new THREE.DirectionalLight(0xffe6c2, 1.9); sun.position.set(6, 12, 5); sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048); scene.add(sun);
scene.add(new THREE.HemisphereLight(0xffe6bf, 0x6b4a2a, 0.6));

// izquierda: la marcha (mira hacia +Z / la muralla al fondo)
const march = buildProcessionCrowd(scene, plastic, { mode: 'march', origin: { x: -6, z: 2 }, rows: 3, perRow: 5, facingYaw: 0 });
// derecha: la celebración
const joy = buildProcessionCrowd(scene, plastic, { mode: 'celebration', origin: { x: 6, z: 2 }, rows: 3, perRow: 5, facingYaw: 0, startIndex: 40 });

const camera = new THREE.PerspectiveCamera(48, innerWidth / innerHeight, 0.1, 240); camera.position.set(0, 5.5, 14); camera.lookAt(0, 1.4, 0);
const controls = new OrbitControls(camera, renderer.domElement); controls.enableDamping = true; controls.target.set(0, 1.2, 0); controls.update();
const fx = setupPreciousRender(renderer, scene, camera, { preset: 'day' });
function loop(): void { requestAnimationFrame(loop); const dt = 0.016; march.update(dt); joy.update(dt); controls.update(); fx.render(); (window as any).__ready = true; }
loop();
addEventListener('resize', () => { renderer.setSize(innerWidth, innerHeight); fx.setSize(innerWidth, innerHeight); camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix(); });
