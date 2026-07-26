import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { setupPreciousRender } from './core/PreciousRender';
import { PlasticMaterialFactory } from './materials/PlasticMaterialFactory';
import { addBackdrop, backdropRails } from './world/Backdrop';
import { bgJericoMurallas } from './assets/bgJericoMurallas';
import { buildArk } from './world/Ark';

/**
 * Demo del Arca de la Alianza (pieza-héroe) con el acabado "precioso" sobre el
 * fondo real de las murallas. Gira despacio para lucir el oro y los querubines.
 */
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(innerWidth, innerHeight);
document.body.appendChild(renderer.domElement);

const scene = new THREE.Scene();
addBackdrop(scene, bgJericoMurallas, { skyColor: 0xe9c48a });
scene.fog = new THREE.Fog(0xe4a86a, 40, 120);

const plastic = new PlasticMaterialFactory();
plastic.update({ roughness: 0.28, clearcoat: 0.7, envMapIntensity: 1.1 });

const floor = new THREE.Mesh(
  new THREE.PlaneGeometry(200, 200),
  new THREE.MeshStandardMaterial({ color: 0xc9a56a, roughness: 0.95 })
);
floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; scene.add(floor);

const sun = new THREE.DirectionalLight(0xffe6c0, 1.5);
sun.position.set(6, 12, 6); sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048);
scene.add(sun);
scene.add(new THREE.HemisphereLight(0xffe0b0, 0x6b4a2a, 0.5));

const ark = buildArk(plastic, { glow: true });
scene.add(ark.group);

const camera = new THREE.PerspectiveCamera(42, innerWidth / innerHeight, 0.1, 400);
camera.position.set(4.5, 4.2, 7.5); camera.lookAt(0, 2.2, 0);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true; controls.target.set(0, 2.2, 0);
controls.minDistance = 5; controls.maxDistance = 14;
backdropRails(controls);
controls.update();

const fx = setupPreciousRender(renderer, scene, camera, { exposure: 1.0, bloom: { strength: 0.28, radius: 0.5, threshold: 0.9 } });

let auto = 0;
function loop(): void {
  requestAnimationFrame(loop);
  auto += 0.004;
  ark.group.rotation.y = auto;      // gira despacio
  ark.update(0.016);
  controls.update();
  fx.render();
  (window as any).__ready = true;
}
loop();
addEventListener('resize', () => {
  renderer.setSize(innerWidth, innerHeight);
  fx.setSize(innerWidth, innerHeight);
  camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix();
});
