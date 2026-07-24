import * as THREE from 'three';
import { PlasticMaterialFactory } from './materials/PlasticMaterialFactory';
import { buildStall } from './world/Market';
import { buildCrowd } from './world/Crowd';

const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
renderer.setPixelRatio(1); renderer.setSize(innerWidth, innerHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace; renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.2; renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.body.appendChild(renderer.domElement);

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x2a3350);
const plastic = new PlasticMaterialFactory();

// Suelo
const floor = new THREE.Mesh(new THREE.CircleGeometry(20, 48), new THREE.MeshStandardMaterial({ color: 0x585048, roughness: 0.95 }));
floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; scene.add(floor);

// Luz nocturna + relleno cálido (antorcha)
scene.add(new THREE.HemisphereLight(0x8898b8, 0x2a2620, 1.2));
const key = new THREE.DirectionalLight(0xcfe0ff, 1.8); key.position.set(6, 14, 10); key.castShadow = true;
key.shadow.mapSize.set(1024, 1024); key.shadow.camera.left = -16; key.shadow.camera.right = 16; key.shadow.camera.top = 16; key.shadow.camera.bottom = -8;
scene.add(key);
const warm = new THREE.PointLight(0xffa64d, 8, 30, 2); warm.position.set(0, 5, 5); scene.add(warm);

// Dos puestos mirando a la cámara; los clientes a los lados (no tapan el género)
scene.add(buildStall(plastic, { x: -4.2, z: -1, yaw: 0.15, variant: 0 }));
scene.add(buildStall(plastic, { x: 4.2, z: -1, yaw: -0.15, variant: 1 }));

const crowd = buildCrowd(scene, plastic, [
  { x: -7.4, z: 1.6, yaw: 1.2, emotion: 'happy' },        // clienta a la izquierda del puesto
  { x: 7.4, z: 1.6, yaw: -1.2, emotion: 'neutral' },      // cliente a la derecha
  { x: 0, z: 4, yaw: Math.PI, emotion: 'surprised', scale: 0.66 } // un niño delante
]);

const camera = new THREE.PerspectiveCamera(46, innerWidth / innerHeight, 0.1, 200);
camera.position.set(0, 6.5, 15); camera.lookAt(0, 3, -1);

let t = 0;
function loop(): void {
  requestAnimationFrame(loop);
  t += 0.016;
  crowd.update(0.016);
  renderer.render(scene, camera);
  (window as any).__ready = true;
}
loop();
addEventListener('resize', () => { renderer.setSize(innerWidth, innerHeight); camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix(); });
