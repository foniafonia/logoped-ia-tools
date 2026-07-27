import * as THREE from 'three';
import { PlasticMaterialFactory } from '../../materials/PlasticMaterialFactory';
import { Dust } from '../../effects/Dust';
import { tiledTexture } from '../../materials/tiling';
import { texEarth } from '../../assets/texEarth';
import { buildClimax } from './climax';

// Preview de verificación del CLÍMAX (muralla + derrumbe). No es el juego: monta una
// escena mínima (suelo + luz + cámara) para capturar/probar el módulo `buildClimax`.
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(1);
renderer.setSize(innerWidth, innerHeight);
renderer.shadowMap.enabled = true;
document.body.appendChild(renderer.domElement);

const scene = new THREE.Scene();
scene.background = new THREE.Color(0xdcc79a);
scene.fog = new THREE.Fog(0xdcc79a, 120, 320);

const camera = new THREE.PerspectiveCamera(55, innerWidth / innerHeight, 0.1, 1000);
camera.position.set(0, 24, 62);
camera.lookAt(0, 10, -40);

scene.add(new THREE.HemisphereLight(0xffe9c0, 0xa9895f, 0.6));
const key = new THREE.DirectionalLight(0xffd9a0, 2.6);
key.position.set(-30, 44, 34); scene.add(key);

const ground = new THREE.Mesh(
  new THREE.PlaneGeometry(700, 700),
  new THREE.MeshStandardMaterial({ map: tiledTexture(texEarth, 48), roughness: 1 })
);
ground.rotation.x = -Math.PI / 2; ground.receiveShadow = true; scene.add(ground);

const plastic = new PlasticMaterialFactory();
const dust = new Dust(scene);
const cl = buildClimax(scene, plastic, dust);

(window as any).__soplar = () => cl.soplarShofar();
(window as any).__cayo = () => cl.cayo();
(window as any).__cam = (x: number, y: number, z: number, lx: number, ly: number, lz: number) => {
  camera.position.set(x, y, z); camera.lookAt(lx, ly, lz);
};
(window as any).__READY__ = true;

let last = 0;
function animate(now: number): void {
  requestAnimationFrame(animate);
  const dt = Math.min(0.05, (now - last) / 1000 || 0.016); last = now;
  cl.update(dt, now / 1000);
  dust.update(dt);
  renderer.render(scene, camera);
}
requestAnimationFrame(animate);
addEventListener('resize', () => {
  camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
});
