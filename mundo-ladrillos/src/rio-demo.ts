import * as THREE from 'three';
import { setupPreciousRender } from './core/PreciousRender';
import { PlasticMaterialFactory } from './materials/PlasticMaterialFactory';
import { tiledTexture } from './materials/tiling';
import { texWater } from './assets/texWater';
import { texSand } from './assets/texSand';
import { buildPalm, buildFirePit, buildCrateStack } from './world/Clutter';

/**
 * Demo "río Jordán": lámina de agua REAL (Higgsfield, tileable) con CORRIENTE
 * animada (offset) entre dos orillas de arena texturizada + palmeras. Nada de
 * planos azules planos (Regla Nº1). Base para el cruce del Jordán (min 5–10).
 */
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(innerWidth, innerHeight);
document.body.appendChild(renderer.domElement);

const scene = new THREE.Scene();
scene.background = new THREE.Color(0xcfe0ec);
scene.fog = new THREE.Fog(0xcfe0ec, 40, 100);

const plastic = new PlasticMaterialFactory();
plastic.update({ roughness: 0.34, clearcoat: 0.55, envMapIntensity: 1.0 });

// agua: plano ancho con textura tileada; guardamos el map para animar la corriente
const waterMap = tiledTexture(texWater, 8);
const water = new THREE.Mesh(
  new THREE.PlaneGeometry(120, 16),
  new THREE.MeshStandardMaterial({ map: waterMap, roughness: 0.28, metalness: 0.0, envMapIntensity: 1.3 })
);
water.rotation.x = -Math.PI / 2; water.position.y = 0.02; water.receiveShadow = true; scene.add(water);

// orillas de arena (dos bandas texturizadas a cada lado del río)
const sandMat = new THREE.MeshStandardMaterial({ map: tiledTexture(texSand, 16), roughness: 0.97 });
for (const z of [-15, 15]) {
  const bank = new THREE.Mesh(new THREE.PlaneGeometry(120, 22), sandMat);
  bank.rotation.x = -Math.PI / 2; bank.position.set(0, 0.03, z); bank.receiveShadow = true; scene.add(bank);
}

const sun = new THREE.DirectionalLight(0xfff2d8, 2.0);
sun.position.set(10, 18, 10); sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048);
scene.add(sun);
scene.add(new THREE.HemisphereLight(0xbfd6ff, 0x6b5a3c, 0.85));

// vida en las orillas (Regla Nº1)
scene.add(buildPalm(plastic, { x: -10, z: -13, height: 5.4 }));
scene.add(buildPalm(plastic, { x: -6, z: 14, height: 4.8 }));
scene.add(buildPalm(plastic, { x: 9, z: -14, height: 5.0 }));
scene.add(buildCrateStack(plastic, { x: 6, z: 13 }));
scene.add(buildFirePit(plastic, { x: -12, z: 12 }));

const camera = new THREE.PerspectiveCamera(50, innerWidth / innerHeight, 0.1, 200);
camera.position.set(0, 7, 24); camera.lookAt(0, 1.2, 0);

const fx = setupPreciousRender(renderer, scene, camera, { exposure: 1.06, preset: 'day' });

function loop(): void {
  requestAnimationFrame(loop);
  waterMap.offset.y -= 0.0016;  // corriente
  waterMap.offset.x += 0.0004;
  fx.render();
  (window as any).__ready = true;
}
loop();
addEventListener('resize', () => {
  renderer.setSize(innerWidth, innerHeight);
  fx.setSize(innerWidth, innerHeight);
  camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix();
});
