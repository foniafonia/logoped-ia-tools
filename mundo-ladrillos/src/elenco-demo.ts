import * as THREE from 'three';
import { setupPreciousRender } from './core/PreciousRender';
import { PlasticMaterialFactory } from './materials/PlasticMaterialFactory';
import { createMinifigure, CHARACTER_SKINS } from './characters/MinifigureFactory';

/**
 * Demo "elenco": todos los personajes canónicos (biblia peli.json) alineados para
 * verificar que clavan la referencia (piel, ropa, tocado, barba). Yehoshúa,
 * Rahab, espías, guardias, jefe, sacerdote, beduino, rabino.
 */
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(innerWidth, innerHeight);
document.body.appendChild(renderer.domElement);

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x2a2f3a);

const plastic = new PlasticMaterialFactory();
plastic.update({ roughness: 0.34, clearcoat: 0.6, envMapIntensity: 1.0 });

const floor = new THREE.Mesh(
  new THREE.PlaneGeometry(80, 40),
  new THREE.MeshStandardMaterial({ color: 0x3a3f4a, roughness: 0.9 })
);
floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; scene.add(floor);

const key = new THREE.DirectionalLight(0xffffff, 2.0);
key.position.set(6, 14, 10); key.castShadow = true; key.shadow.mapSize.set(2048, 2048); scene.add(key);
scene.add(new THREE.HemisphereLight(0xcfe0ff, 0x40403a, 0.85));

const names = Object.keys(CHARACTER_SKINS);
const perRow = 6;
const gapX = 2.4, gapZ = 3.2;
names.forEach((k, i) => {
  const fig = createMinifigure(plastic, CHARACTER_SKINS[k]);
  const col = i % perRow, row = Math.floor(i / perRow);
  fig.root.position.set((col - (perRow - 1) / 2) * gapX, 0, row * gapZ);
  fig.root.rotation.y = 0.25;
  scene.add(fig.root);
});

const camera = new THREE.PerspectiveCamera(46, innerWidth / innerHeight, 0.1, 200);
camera.position.set(0, 6.5, 15.5); camera.lookAt(0, 2.4, 1.6);

const fx = setupPreciousRender(renderer, scene, camera, { exposure: 1.08, preset: 'interior' });

function loop(): void { requestAnimationFrame(loop); fx.render(); (window as any).__ready = true; }
loop();
addEventListener('resize', () => {
  renderer.setSize(innerWidth, innerHeight);
  fx.setSize(innerWidth, innerHeight);
  camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix();
});
