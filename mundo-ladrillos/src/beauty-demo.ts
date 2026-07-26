import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';
import { SMAAPass } from 'three/examples/jsm/postprocessing/SMAAPass.js';
import { PlasticMaterialFactory } from './materials/PlasticMaterialFactory';
import { createMinifigure, CHARACTER_SKINS, villagerSkin } from './characters/MinifigureFactory';
import { buildStall } from './world/Market';

/**
 * Demo "precioso EN el juego" (motor web, tiempo real): la MISMA escena
 * renderizada en modo `plano` (como ahora) vs `precioso` (iluminación por
 * entorno/IBL + materiales que reflejan + post-proceso bloom + tono cinemático
 * + sombras suaves). Sin salir de la web. ?mode=plano | precioso
 */
const params = new URLSearchParams(location.search);
const precioso = params.get('mode') !== 'plano';

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(1);
renderer.setSize(innerWidth, innerHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = precioso ? 1.05 : 1.0;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = precioso ? THREE.PCFSoftShadowMap : THREE.PCFShadowMap;
document.body.appendChild(renderer.domElement);

const scene = new THREE.Scene();
scene.background = new THREE.Color(precioso ? 0x2a2418 : 0xe9e4d6);

// --- IBL: reflejos suaves de estudio (esto es lo que hace brillar el plástico) ---
if (precioso) {
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
}

const plastic = new PlasticMaterialFactory();

// --- Suelo ---
const floor = new THREE.Mesh(
  new THREE.CircleGeometry(30, 64),
  new THREE.MeshStandardMaterial({ color: precioso ? 0x6b5b3f : 0xd9d2c0, roughness: 0.9, metalness: 0 })
);
floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; scene.add(floor);

// --- Luces ---
if (precioso) {
  scene.add(new THREE.HemisphereLight(0xfff0d8, 0x40382a, 0.6));
  const key = new THREE.DirectionalLight(0xffd9a0, 2.6);
  key.position.set(6, 10, 6); key.castShadow = true;
  key.shadow.mapSize.set(2048, 2048);
  key.shadow.camera.left = -12; key.shadow.camera.right = 12; key.shadow.camera.top = 12; key.shadow.camera.bottom = -12;
  key.shadow.bias = -0.0002; key.shadow.radius = 4;
  scene.add(key);
  const rim = new THREE.DirectionalLight(0x9ab8ff, 0.9); rim.position.set(-8, 6, -6); scene.add(rim);
} else {
  scene.add(new THREE.HemisphereLight(0xffffff, 0x9a8f78, 1.5));
  const key = new THREE.DirectionalLight(0xfff2dc, 2.2);
  key.position.set(4, 8, 8); key.castShadow = true; key.shadow.mapSize.set(1024, 1024);
  scene.add(key);
}

// --- Escena: rincón de mercado (personajes + puesto) ---
const stall = buildStall(plastic, { x: 2.4, z: -1.2, yaw: -0.5, variant: 0 });
scene.add(stall);
function place(skin: any, x: number, z: number, yaw: number): void {
  const f = createMinifigure(plastic, skin);
  f.root.position.set(x, 0, z); f.root.rotation.y = yaw; scene.add(f.root);
}
place(CHARACTER_SKINS.yehoshua, -1.6, 0.4, 0.5);
place(CHARACTER_SKINS.rahab, 0.2, 0.9, -0.2);
place(villagerSkin(1), 1.4, 0.2, -0.8);
place(villagerSkin(3), -0.4, -0.8, 0.3);

// Subir un poco el brillo/reflejo del plástico en modo precioso
if (precioso) plastic.update({ roughness: 0.28, clearcoat: 0.6, envMapIntensity: 1.5 });

const camera = new THREE.PerspectiveCamera(38, innerWidth / innerHeight, 0.1, 200);
camera.position.set(3.2, 4.2, 9.5); camera.lookAt(0, 2.2, 0);

// --- Post-proceso (solo precioso) ---
let composer: EffectComposer | null = null;
if (precioso) {
  composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));
  const bloom = new UnrealBloomPass(new THREE.Vector2(innerWidth, innerHeight), 0.32, 0.5, 0.85);
  composer.addPass(bloom);
  composer.addPass(new SMAAPass(innerWidth, innerHeight));
  composer.addPass(new OutputPass());
}

function loop(): void {
  requestAnimationFrame(loop);
  if (composer) composer.render(); else renderer.render(scene, camera);
  (window as any).__ready = true;
}
loop();
addEventListener('resize', () => {
  renderer.setSize(innerWidth, innerHeight);
  composer?.setSize(innerWidth, innerHeight);
  camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix();
});
