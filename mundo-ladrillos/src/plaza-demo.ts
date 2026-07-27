import * as THREE from 'three';
import { setupPreciousRender } from './core/PreciousRender';
import { PlasticMaterialFactory } from './materials/PlasticMaterialFactory';
import { buildCrowd } from './world/Crowd';
import { buildStall } from './world/Market';
import { buildWell } from './world/StreetProps';
import { buildCrateStack, buildSackPile, buildPotCluster, buildPalm } from './world/Clutter';
import { tiledTexture } from './materials/tiling';
import { texStreet } from './assets/texStreet';

/**
 * Demo "plaza empedrada": suelo con textura REAL de calle (Higgsfield, tileable)
 * en vez de un plano plano (Regla Nº1), poblada con multitud variada (incluye los
 * presets nuevos: risa, pícaro, apenada) + attrezzo suelto. Día nítido (preset day).
 */
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(innerWidth, innerHeight);
document.body.appendChild(renderer.domElement);

const scene = new THREE.Scene();
scene.background = new THREE.Color(0xbcd0e0);
scene.fog = new THREE.Fog(0xbcd0e0, 34, 90);

const plastic = new PlasticMaterialFactory();
plastic.update({ roughness: 0.34, clearcoat: 0.55, envMapIntensity: 1.0 });

// suelo empedrado real (tileado) — nada de plano pelado
const floor = new THREE.Mesh(
  new THREE.PlaneGeometry(120, 120),
  new THREE.MeshStandardMaterial({ map: tiledTexture(texStreet, 22), roughness: 0.96 })
);
floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; scene.add(floor);

const sun = new THREE.DirectionalLight(0xfff2d8, 2.1);
sun.position.set(12, 20, 8); sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048);
scene.add(sun);
scene.add(new THREE.HemisphereLight(0xbfd6ff, 0x6b5a3c, 0.8));

// puestos + pozo + attrezzo (rincones con vida)
scene.add(buildStall(plastic, { x: -6, z: 3, yaw: Math.PI / 2, variant: 0 }));
scene.add(buildStall(plastic, { x: 6, z: 5, yaw: -Math.PI / 2, variant: 1 }));
scene.add(buildWell(plastic, { x: 0, z: 9 }));
scene.add(buildCrateStack(plastic, { x: -4, z: 8 }));
scene.add(buildSackPile(plastic, { x: 4, z: 9.5 }));
scene.add(buildPotCluster(plastic, { x: -2, z: 2 }));
scene.add(buildPalm(plastic, { x: -8, z: -2, height: 5.2 }));
scene.add(buildPalm(plastic, { x: 8, z: -1, height: 4.6 }));

// multitud variada (villagerSkin ya incluye los presets 11-13 nuevos)
const spots: { x: number; z: number; yaw: number }[] = [];
let i = 0;
for (const z of [3, 5.5, 8]) for (const x of [-4, -1.5, 1.5, 4]) {
  spots.push({ x: x + (i % 2) * 0.4, z: z + (i % 3) * 0.3, yaw: 0.3 + (i % 4) * 0.5 });
  i++;
}
const crowd = buildCrowd(scene, plastic, spots, {
  walkers: [
    { ax: -5, az: 6.5, bx: 5, bz: 6.5, speed: 1.2 },
    { ax: 5, az: 4.5, bx: -5, bz: 8.5, speed: 0.9 }
  ]
});

const camera = new THREE.PerspectiveCamera(48, innerWidth / innerHeight, 0.1, 200);
camera.position.set(0.5, 5.2, 19); camera.lookAt(0, 2.4, 6);

const fx = setupPreciousRender(renderer, scene, camera, { exposure: 1.06, preset: 'day' });

function loop(): void { requestAnimationFrame(loop); crowd.update(0.016); fx.render(); (window as any).__ready = true; }
loop();
addEventListener('resize', () => {
  renderer.setSize(innerWidth, innerHeight);
  fx.setSize(innerWidth, innerHeight);
  camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix();
});
