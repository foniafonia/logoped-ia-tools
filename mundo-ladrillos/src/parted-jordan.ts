import * as THREE from 'three';
import { PlasticMaterialFactory } from './materials/PlasticMaterialFactory';
import { createMinifigure, YOSHUA_SKIN, PRIEST_SKIN } from './characters/MinifigureFactory';
import { buildPartedRiver } from './world/PartedRiver';

const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
renderer.setPixelRatio(1); renderer.setSize(innerWidth, innerHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace; renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.25; renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.body.appendChild(renderer.domElement);

const scene = new THREE.Scene();
const plastic = new PlasticMaterialFactory();

// cielo de amanecer + niebla
function sky(): THREE.Texture {
  const c = document.createElement('canvas'); c.width = 16; c.height = 256; const x = c.getContext('2d')!;
  const g = x.createLinearGradient(0, 0, 0, 256);
  g.addColorStop(0, '#1c3a6e'); g.addColorStop(0.5, '#6a7ea8'); g.addColorStop(0.78, '#f0b06a'); g.addColorStop(1, '#f8dca6');
  x.fillStyle = g; x.fillRect(0, 0, 16, 256); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}
scene.background = sky();
scene.fog = new THREE.Fog(0xe6b87a, 40, 200);

scene.add(new THREE.HemisphereLight(0xffe0b0, 0x6a5a44, 1.35));
const sun = new THREE.DirectionalLight(0xffd08a, 2.2); sun.position.set(6, 22, -30); sun.castShadow = true;
sun.shadow.mapSize.set(1024, 1024); sun.shadow.camera.left = -20; sun.shadow.camera.right = 20; sun.shadow.camera.top = 20; sun.shadow.camera.bottom = -12;
scene.add(sun);

// orillas de arena
const sand = new THREE.Mesh(new THREE.PlaneGeometry(400, 400), new THREE.MeshStandardMaterial({ color: 0xdcc390, roughness: 1 }));
sand.rotation.x = -Math.PI / 2; sand.position.y = -0.02; sand.receiveShadow = true; scene.add(sand);

// ★ el río partido
const river = buildPartedRiver(scene, plastic);

// figuras en el cauce: sacerdotes al frente (llevan el Arca) + Yehoshúa
const priestA = createMinifigure(plastic, PRIEST_SKIN); priestA.root.position.set(-1.6, 0, -2); priestA.root.rotation.y = Math.PI; scene.add(priestA.root);
const priestB = createMinifigure(plastic, PRIEST_SKIN); priestB.root.position.set(1.6, 0, -2); priestB.root.rotation.y = Math.PI; scene.add(priestB.root);
// Arca (cofre dorado con varas) entre los dos sacerdotes
const ark = new THREE.Group();
ark.add(new THREE.Mesh(new THREE.BoxGeometry(1.8, 1.1, 1.0), plastic.get(0xcaa14a)).translateY(2.2));
ark.add(new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.25, 1.2), plastic.get(0xd9b85a)).translateY(2.85));
for (const ax of [-1.0, 1.0]) ark.add(new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 3.2, 6), plastic.get(0x8a6a2a)).rotateX(Math.PI / 2).translateX(ax).translateY(2.1).translateZ(0));
ark.position.set(0, 0, -2); scene.add(ark);
const yeho = createMinifigure(plastic, YOSHUA_SKIN); yeho.root.position.set(0, 0, 5); yeho.root.rotation.y = Math.PI; scene.add(yeho.root);

const camera = new THREE.PerspectiveCamera(52, innerWidth / innerHeight, 0.1, 400);
camera.position.set(3.5, 6.5, 20); camera.lookAt(0, 5, -20);

let last = 0;
function loop(ms: number): void {
  requestAnimationFrame(loop);
  const dt = Math.min(0.05, (ms - last) / 1000 || 0.016); last = ms;
  river.update(dt); priestA.update(dt, false); priestB.update(dt, false); yeho.update(dt, false);
  renderer.render(scene, camera);
  (window as any).__ready = true;
}
requestAnimationFrame(loop);
addEventListener('resize', () => { renderer.setSize(innerWidth, innerHeight); camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix(); });
