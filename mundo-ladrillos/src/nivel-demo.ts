import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';
import { SMAAPass } from 'three/examples/jsm/postprocessing/SMAAPass.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { PlasticMaterialFactory } from './materials/PlasticMaterialFactory';
import { createMinifigure, CHARACTER_SKINS } from './characters/MinifigureFactory';
import { buildCrowd } from './world/Crowd';
import { buildStall } from './world/Market';
import { buildLanternString, buildLaundryLine, buildWell } from './world/StreetProps';

/**
 * NIVEL demo: nuestra calle nocturna de Jericó con el acabado "precioso"
 * (IBL + post-proceso bloom/tono + sombras suaves + luces cálidas). Mismo
 * motor web, tiempo real. Enseña a dónde llega el juego sin salir del navegador.
 */
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(1);
renderer.setSize(innerWidth, innerHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.15;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.body.appendChild(renderer.domElement);

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0e1426);
scene.fog = new THREE.Fog(0x0e1426, 24, 60);

const pmrem = new THREE.PMREMGenerator(renderer);
scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.02).texture;

const plastic = new PlasticMaterialFactory();
plastic.update({ roughness: 0.3, clearcoat: 0.6, envMapIntensity: 0.9 });

// Suelo empedrado oscuro
const floor = new THREE.Mesh(
  new THREE.PlaneGeometry(120, 120),
  new THREE.MeshStandardMaterial({ color: 0x3a3730, roughness: 0.95 })
);
floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; scene.add(floor);

// Luna fría + relleno cálido + hemisférica de noche
const moon = new THREE.DirectionalLight(0xcfe0ff, 1.4);
moon.position.set(-12, 20, 8); moon.castShadow = true;
moon.shadow.mapSize.set(2048, 2048);
moon.shadow.camera.left = -30; moon.shadow.camera.right = 30; moon.shadow.camera.top = 24; moon.shadow.camera.bottom = -18;
moon.shadow.bias = -0.0002; moon.shadow.radius = 4;
scene.add(moon);
scene.add(new THREE.HemisphereLight(0x384868, 0x14100a, 0.6));

// Casas a ambos lados
function house(x: number, z: number, color: number, h = 5): void {
  const w = new THREE.Mesh(new THREE.BoxGeometry(6, h, 6), plastic.get(color));
  w.position.set(x, h / 2, z); w.castShadow = true; w.receiveShadow = true;
  const roof = new THREE.Mesh(new THREE.BoxGeometry(6.6, 0.6, 6.6), plastic.get(0x6e4a2c));
  roof.position.set(x, h + 0.3, z); roof.castShadow = true;
  scene.add(w, roof);
}
for (const z of [-4, 4, 12]) { house(-9, z, 0xb9a36f); house(9, z, 0xc9b083); }

// Attrezzo de calle: farolillos, ropa tendida, pozo, puestos
scene.add(buildLanternString(plastic, { ax: -8, az: 2, bx: 8, bz: 2, height: 6.2, count: 8, lights: 4 }));
scene.add(buildLanternString(plastic, { ax: -8, az: 10, bx: 8, bz: 10, height: 6.2, count: 8, lights: 4 }));
scene.add(buildLaundryLine(plastic, { ax: -9, az: -2, bx: -6, bz: 4, height: 5, count: 4, seed: 1 }));
scene.add(buildWell(plastic, { x: 5.5, z: 6 }));
scene.add(buildStall(plastic, { x: -5.5, z: 5, yaw: Math.PI / 2, variant: 0 }));
scene.add(buildStall(plastic, { x: -5.5, z: 12, yaw: Math.PI / 2, variant: 2 }));

// Gente
const crowd = buildCrowd(scene, plastic, [
  { x: -3, z: 3, yaw: 0.4, emotion: 'happy' },
  { x: 2, z: 2, yaw: -0.6, emotion: 'surprised' },
  { x: -1.5, z: 6, yaw: 0.2, emotion: 'neutral' },
  { x: 3.2, z: 8, yaw: -1.2, emotion: 'worried' },
  { x: -3.5, z: 9, yaw: 0.8, emotion: 'happy', scale: 0.66 }
]);
// Héroe azul de espaldas, entrando por la calle
const hero = createMinifigure(plastic, CHARACTER_SKINS.yehoshua);
hero.root.position.set(0, 0, 14); hero.root.rotation.y = Math.PI; scene.add(hero.root);

const camera = new THREE.PerspectiveCamera(46, innerWidth / innerHeight, 0.1, 200);
camera.position.set(2.6, 4.2, 20); camera.lookAt(0, 2.2, 4);

// Explorar: arrastrar = mirar alrededor · pellizcar/rueda = acercar
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true; controls.dampingFactor = 0.08;
controls.target.set(0, 2.2, 5);
controls.minDistance = 4; controls.maxDistance = 34;
controls.maxPolarAngle = Math.PI / 2.05;
controls.update();

const hint = document.createElement('div');
hint.textContent = 'Arrastra para mirar · pellizca para acercar';
Object.assign(hint.style, {
  position: 'fixed', left: '0', right: '0', bottom: '14px', textAlign: 'center',
  color: '#f4e9d2', font: '600 15px system-ui, sans-serif', textShadow: '0 2px 6px #000',
  pointerEvents: 'none', opacity: '0.9'
} as CSSStyleDeclaration);
document.body.appendChild(hint);
setTimeout(() => { hint.style.transition = 'opacity 1s'; hint.style.opacity = '0'; }, 6000);

const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));
composer.addPass(new UnrealBloomPass(new THREE.Vector2(innerWidth, innerHeight), 0.5, 0.6, 0.7));
composer.addPass(new SMAAPass(innerWidth, innerHeight));
composer.addPass(new OutputPass());

let t = 0;
function loop(): void {
  requestAnimationFrame(loop);
  t += 0.016; crowd.update(0.016);
  controls.update();
  composer.render();
  (window as any).__ready = true;
}
loop();
addEventListener('resize', () => {
  renderer.setSize(innerWidth, innerHeight);
  composer.setSize(innerWidth, innerHeight);
  camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix();
});
