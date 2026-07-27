import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { setupPreciousRender } from './core/PreciousRender';
import { PlasticMaterialFactory } from './materials/PlasticMaterialFactory';
import { addBackdrop } from './world/Backdrop';
import { bgCampamento } from './assets/bgCampamento';
import { buildTent, buildFirePit, buildCrateStack, buildPalm } from './world/Clutter';

/**
 * tienda-demo — la tienda de campaña del desierto (buildTent). Una abierta con
 * el perchero de trajes de sigilo dentro (E10/E12) y otra cerrada, con fogata y
 * cajas alrededor para que se vea el montaje de un campamento (Regla Nº1).
 */
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(innerWidth, innerHeight); document.body.appendChild(renderer.domElement);
const scene = new THREE.Scene(); addBackdrop(scene, bgCampamento, { skyColor: 0xd8c090 });
scene.fog = new THREE.Fog(0xdcb47f, 34, 100);
const plastic = new PlasticMaterialFactory(); plastic.update({ roughness: 0.5, clearcoat: 0.35, envMapIntensity: 0.8 });
const floor = new THREE.Mesh(new THREE.PlaneGeometry(120, 120), new THREE.MeshStandardMaterial({ color: 0xc9a878, roughness: 0.97 }));
floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; scene.add(floor);
const sun = new THREE.DirectionalLight(0xffe8c8, 1.9); sun.position.set(6, 12, 5); sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048); scene.add(sun);
scene.add(new THREE.HemisphereLight(0xffe6bf, 0x6b4a2a, 0.6));

// tienda abierta con perchero de trajes de sigilo (mira de frente)
scene.add(buildTent(plastic, { x: -2.2, z: 0.4, yaw: 0.35, rack: true }));
// tienda cerrada, algo más grande, girada
scene.add(buildTent(plastic, { x: 3, z: -1.5, yaw: -0.6, scale: 1.15, color: 0xa9895a }));
scene.add(buildFirePit(plastic, { x: 0.4, z: 2.4 }));
scene.add(buildCrateStack(plastic, { x: 4.6, z: 1.2, yaw: 0.2 }));
scene.add(buildPalm(plastic, { x: -5, z: -2.5, height: 5.2 }));

const camera = new THREE.PerspectiveCamera(46, innerWidth / innerHeight, 0.1, 200); camera.position.set(0.5, 4, 9.5); camera.lookAt(0, 1.4, 0);
const controls = new OrbitControls(camera, renderer.domElement); controls.enableDamping = true; controls.target.set(0, 1.2, 0); controls.update();
const fx = setupPreciousRender(renderer, scene, camera, { preset: 'day' });
function loop(): void { requestAnimationFrame(loop); controls.update(); fx.render(); (window as any).__ready = true; }
loop();
addEventListener('resize', () => { renderer.setSize(innerWidth, innerHeight); fx.setSize(innerWidth, innerHeight); camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix(); });
