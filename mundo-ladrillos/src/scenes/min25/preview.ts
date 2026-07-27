import * as THREE from 'three';
import { PlasticMaterialFactory } from '../../materials/PlasticMaterialFactory';
import { AudioManager } from '../../audio/AudioManager';
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
const audio = new AudioManager();
const player = new THREE.Vector3(0, 0, 40);          // jugador-proxy (la orquestación real lo da el juego)
const victoria = (): void => {
  const v = document.createElement('div');
  v.innerHTML = '🎺 <b>¡JERICÓ HA CAÍDO!</b><br>Rahab está a salvo. ¡VICTORIA!';
  v.style.cssText = `position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);text-align:center;
    font:800 40px system-ui;color:#fff;background:rgba(20,30,55,.9);padding:28px 48px;border-radius:20px;
    border:3px solid rgba(255,220,120,.7);box-shadow:0 10px 40px rgba(0,0,0,.6);z-index:50;line-height:1.5`;
  document.body.appendChild(v);
};
const cl = buildClimax(scene, plastic, audio, () => player, dust, victoria);

(window as any).__setPlayer = (x: number, z: number) => player.set(x, 0, z);
(window as any).__aRahab = () => player.set(34, 0, 2);   // llevar al jugador a Rahab (victoria)
(window as any).__ganado = () => cl.ganado();
// acerca al jugador al shofar y "pulsa E" → dispara el derrumbe (la escena insignia)
(window as any).__soplar = () => { player.set(cl.shofarPos.x, 0, cl.shofarPos.z); dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyE' })); };
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
