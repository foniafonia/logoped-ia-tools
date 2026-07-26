import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { setupPreciousRender } from './core/PreciousRender';
import { PlasticMaterialFactory } from './materials/PlasticMaterialFactory';
import { createMinifigure, CHARACTER_SKINS } from './characters/MinifigureFactory';
import { buildCrowd } from './world/Crowd';
import { buildStall } from './world/Market';
import { buildLanternString, buildLaundryLine, buildWell } from './world/StreetProps';
import { addBackdrop, backdropRails } from './world/Backdrop';
import { jericoBackdrop } from './assets/jericoBackdrop';

/**
 * NIVEL demo: nuestra calle de Jericó al atardecer con el acabado "precioso"
 * (IBL + post-proceso bloom/tono + sombras suaves + luces cálidas). El fondo
 * lejano (llanura de Jericó amurallada) es una imagen real generada en
 * Higgsfield, incrustada como telón. Mismo motor web, tiempo real.
 */
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(innerWidth, innerHeight);
document.body.appendChild(renderer.domElement);

const scene = new THREE.Scene();
scene.background = new THREE.Color(0xf3c48a); // cielo cálido de respaldo (sin negros nunca)
scene.fog = new THREE.Fog(0xe4a86a, 46, 130);

const plastic = new PlasticMaterialFactory();
plastic.update({ roughness: 0.32, clearcoat: 0.6, envMapIntensity: 1.0 });

// --- Telón de fondo: imagen real de Higgsfield (llanura de Jericó, atardecer) ---
// Anclado AL MUNDO (no a la pantalla) → paralaje real, no "pegote". Ahora en 1
// línea con el helper reutilizable `world/Backdrop` (mismo cilindro curvo).
addBackdrop(scene, jericoBackdrop, { skyColor: 0xf3c48a });

// Suelo de arena/empedrado cálido que enlaza con la imagen
const floor = new THREE.Mesh(
  new THREE.PlaneGeometry(200, 200),
  new THREE.MeshStandardMaterial({ color: 0x8a6a44, roughness: 0.96 })
);
floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; scene.add(floor);

// Sol bajo de atardecer (cálido, desde la derecha como en la imagen) + relleno
const sun = new THREE.DirectionalLight(0xffd39a, 2.2);
sun.position.set(16, 12, -6); sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048);
sun.shadow.camera.left = -34; sun.shadow.camera.right = 34;
sun.shadow.camera.top = 26; sun.shadow.camera.bottom = -20;
sun.shadow.bias = -0.0002; sun.shadow.radius = 5;
scene.add(sun);
scene.add(new THREE.HemisphereLight(0xffcf9a, 0x5a3d24, 0.85));
scene.add(new THREE.AmbientLight(0xffe6c2, 0.25));

// Casas a ambos lados (tonos arena cálidos)
function house(x: number, z: number, color: number, h = 5): void {
  const w = new THREE.Mesh(new THREE.BoxGeometry(6, h, 6), plastic.get(color));
  w.position.set(x, h / 2, z); w.castShadow = true; w.receiveShadow = true;
  const roof = new THREE.Mesh(new THREE.BoxGeometry(6.6, 0.6, 6.6), plastic.get(0x7a4f28));
  roof.position.set(x, h + 0.3, z); roof.castShadow = true;
  scene.add(w, roof);
}
for (const z of [-4, 4, 12]) { house(-9, z, 0xc7a866); house(9, z, 0xd8b877); }

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
// Héroe azul de espaldas, entrando por la calle hacia la ciudad
const hero = createMinifigure(plastic, CHARACTER_SKINS.yehoshua);
hero.root.position.set(0, 0, 14); hero.root.rotation.y = Math.PI; scene.add(hero.root);

const camera = new THREE.PerspectiveCamera(46, innerWidth / innerHeight, 0.1, 400);
camera.position.set(2.6, 4.2, 20); camera.lookAt(0, 3.4, 4);

// Explorar: arrastrar = mirar alrededor · pellizcar/rueda = acercar
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true; controls.dampingFactor = 0.08;
controls.target.set(0, 3, 5);
// Cámara "sobre raíles": arco frontal. Evita cenital y giros que rompan el telón.
controls.minDistance = 5; controls.maxDistance = 20;
backdropRails(controls); // topes de azimut/polar del helper (arco frontal)
controls.update();

const hint = document.createElement('div');
hint.textContent = 'Arrastra para mirar · pellizca para acercar';
Object.assign(hint.style, {
  position: 'fixed', left: '0', right: '0', bottom: '14px', textAlign: 'center',
  color: '#fff2dc', font: '600 15px system-ui, sans-serif', textShadow: '0 2px 6px #000',
  pointerEvents: 'none', opacity: '0.9'
} as CSSStyleDeclaration);
document.body.appendChild(hint);
setTimeout(() => { hint.style.transition = 'opacity 1s'; hint.style.opacity = '0'; }, 6000);

// Acabado "precioso" en 1 línea (IBL + bloom + SMAA + tono/sombras, respeta móvil)
const fx = setupPreciousRender(renderer, scene, camera, { exposure: 1.1, bloom: { strength: 0.42, radius: 0.6, threshold: 0.8 } });

let t = 0;
function loop(): void {
  requestAnimationFrame(loop);
  t += 0.016; crowd.update(0.016);
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
