import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { setupPreciousRender } from './core/PreciousRender';
import { PlasticMaterialFactory } from './materials/PlasticMaterialFactory';
import { buildShofar } from './world/Shofar';

/** Demo del shofar (cuerno de carnero) girando, con el acabado precioso. */
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(innerWidth, innerHeight);
document.body.appendChild(renderer.domElement);

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x243247);

const plastic = new PlasticMaterialFactory();
plastic.update({ roughness: 0.4, clearcoat: 0.5, envMapIntensity: 1.0 });

const floor = new THREE.Mesh(new THREE.PlaneGeometry(60, 60), new THREE.MeshStandardMaterial({ color: 0x2c3b52, roughness: 0.95 }));
floor.rotation.x = -Math.PI / 2; floor.position.y = -0.5; floor.receiveShadow = true; scene.add(floor);

const key = new THREE.DirectionalLight(0xfff0d8, 2.0);
key.position.set(4, 8, 5); key.castShadow = true; key.shadow.mapSize.set(1024, 1024); scene.add(key);
scene.add(new THREE.HemisphereLight(0xbcd0ff, 0x30251a, 0.7));

const shofar = buildShofar(plastic, { scale: 1.4 });
shofar.position.y = 0.2;
scene.add(shofar);

const camera = new THREE.PerspectiveCamera(45, innerWidth / innerHeight, 0.1, 200);
camera.position.set(3.5, 2.4, 5);
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true; controls.target.set(1.6, 1.2, 0); controls.update();

const fx = setupPreciousRender(renderer, scene, camera, { exposure: 1.05, bloom: { strength: 0.3, threshold: 0.85 } });

let t = 0;
function loop(): void {
  requestAnimationFrame(loop);
  t += 0.005; shofar.rotation.y = t;
  controls.update(); fx.render();
  (window as any).__ready = true;
}
loop();
addEventListener('resize', () => {
  renderer.setSize(innerWidth, innerHeight);
  fx.setSize(innerWidth, innerHeight);
  camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix();
});
