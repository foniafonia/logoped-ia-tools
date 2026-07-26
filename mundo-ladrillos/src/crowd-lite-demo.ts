import * as THREE from 'three';
import { setupPreciousRender } from './core/PreciousRender';
import { PlasticMaterialFactory } from './materials/PlasticMaterialFactory';
import { GUARD_SKIN, GUARD_CHIEF_SKIN } from './characters/MinifigureFactory';
import { buildCrowd } from './world/Crowd';
import { buildStall } from './world/Market';
import { buildLanternString, buildWell } from './world/StreetProps';

/**
 * Demo "multitud LITE variada": mercado nocturno POBLADO con aldeanos coloridos
 * (rompe el marrón) + guardias con presencia, en modo `lite` (sin sombras, barato
 * para densidad y suave en móvil). Mismo motor, tiempo real.
 */
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(innerWidth, innerHeight);
document.body.appendChild(renderer.domElement);

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x24304a); // cielo nocturno cálido-frío
scene.fog = new THREE.Fog(0x24304a, 26, 80);

const plastic = new PlasticMaterialFactory();
plastic.update({ roughness: 0.32, clearcoat: 0.6, envMapIntensity: 1.0 });

const floor = new THREE.Mesh(
  new THREE.PlaneGeometry(120, 120),
  new THREE.MeshStandardMaterial({ color: 0x3a3730, roughness: 0.95 })
);
floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; scene.add(floor);

const moon = new THREE.DirectionalLight(0xcfe0ff, 1.3);
moon.position.set(-10, 18, 8); moon.castShadow = true; moon.shadow.mapSize.set(2048, 2048);
scene.add(moon);
scene.add(new THREE.HemisphereLight(0x4a5878, 0x1a140c, 0.7));

// puestos + farolillos + pozo (mercado)
scene.add(buildStall(plastic, { x: -6, z: 4, yaw: Math.PI / 2, variant: 0 }));
scene.add(buildStall(plastic, { x: -6, z: 10, yaw: Math.PI / 2, variant: 2 }));
scene.add(buildStall(plastic, { x: 6, z: 6, yaw: -Math.PI / 2, variant: 1 }));
scene.add(buildLanternString(plastic, { ax: -7, az: 3, bx: 7, bz: 3, height: 6.2, count: 9, lights: 5 }));
scene.add(buildLanternString(plastic, { ax: -7, az: 9, bx: 7, bz: 9, height: 6.2, count: 9, lights: 5 }));
scene.add(buildWell(plastic, { x: 4.5, z: 11 }));

// Multitud LITE: muchos aldeanos variados (colores) + 2 guardias con presencia
const spots = [];
let i = 0;
for (const z of [3, 5.5, 8, 10.5]) {
  for (const x of [-4, -1.5, 1.5, 4]) {
    spots.push({ x: x + (i % 2) * 0.4, z: z + (i % 3) * 0.3, yaw: 0.3 + (i % 4) * 0.4 });
    i++;
  }
}
// dos guardias con presencia (lanza + casco), colados por skin
spots.push({ x: -2.4, z: 6.5, yaw: 0.2, skin: GUARD_SKIN });
spots.push({ x: 2.2, z: 8.5, yaw: -0.4, skin: GUARD_CHIEF_SKIN });

const crowd = buildCrowd(scene, plastic, spots, {
  lite: true,
  walkers: [
    { ax: -5, az: 6.5, bx: 5, bz: 6.5, speed: 1.3 },
    { ax: 5, az: 4.5, bx: -5, bz: 8.5, speed: 1.0 }
  ]
});

const camera = new THREE.PerspectiveCamera(48, innerWidth / innerHeight, 0.1, 200);
camera.position.set(0.5, 5.2, 19); camera.lookAt(0, 2.6, 6);

const fx = setupPreciousRender(renderer, scene, camera, { exposure: 1.08, preset: 'night' });

function loop(): void { requestAnimationFrame(loop); crowd.update(0.016); fx.render(); (window as any).__ready = true; }
loop();
addEventListener('resize', () => {
  renderer.setSize(innerWidth, innerHeight);
  fx.setSize(innerWidth, innerHeight);
  camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix();
});
