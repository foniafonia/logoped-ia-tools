import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { setupPreciousRender } from './core/PreciousRender';
import { PlasticMaterialFactory } from './materials/PlasticMaterialFactory';
import { addBackdrop } from './world/Backdrop';
import { bgJericoMurallas } from './assets/bgJericoMurallas';
import { buildNightMarketCrowd } from './world/Crowd';
import { buildFirePit, buildTent, buildCrateStack, buildPotCluster } from './world/Clutter';

/**
 * mercado-noche-demo — muestra `buildNightMarketCrowd`: multitud LITE variada y
 * con carácter de noche (regateo, asombro, encapuchados, niña asustada…) alrededor
 * de una fogata, con tienda + attrezzo para que NADA quede pelado (Regla Nº1).
 * Pensado como plantilla para poblar el mercado nocturno de 5–10 / 10–15.
 */
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(innerWidth, innerHeight); document.body.appendChild(renderer.domElement);
const scene = new THREE.Scene(); addBackdrop(scene, bgJericoMurallas, { skyColor: 0x1a2233 });
scene.fog = new THREE.Fog(0x141c2b, 22, 70);
const plastic = new PlasticMaterialFactory(); plastic.update({ roughness: 0.5, clearcoat: 0.3, envMapIntensity: 0.55 });
const floor = new THREE.Mesh(new THREE.PlaneGeometry(120, 120), new THREE.MeshStandardMaterial({ color: 0x3a3446, roughness: 0.98 }));
floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; scene.add(floor);
const moon = new THREE.DirectionalLight(0x9fb4e0, 0.7); moon.position.set(-5, 11, -3); moon.castShadow = true; moon.shadow.mapSize.set(2048, 2048); scene.add(moon);
scene.add(new THREE.HemisphereLight(0x24304a, 0x0c0f16, 0.5));

// attrezzo (Regla Nº1) + fogata que da la luz cálida del mercado
scene.add(buildFirePit(plastic, { x: 0, z: -2 }));
scene.add(buildTent(plastic, { x: -5, z: -4, yaw: 0.5, color: 0x8a6f44 }));
scene.add(buildCrateStack(plastic, { x: 4.5, z: -3.5, yaw: -0.3 }));
scene.add(buildPotCluster(plastic, { x: 3.4, z: 1.6 }));

// la multitud nocturna variada (lo nuevo)
const crowd = buildNightMarketCrowd(scene, plastic, { center: { x: 0, z: -2 }, radius: 4.4, density: 'med' });

const camera = new THREE.PerspectiveCamera(46, innerWidth / innerHeight, 0.1, 200); camera.position.set(0.5, 4.2, 10.5); camera.lookAt(0, 1.4, -2);
const controls = new OrbitControls(camera, renderer.domElement); controls.enableDamping = true; controls.target.set(0, 1.2, -2); controls.update();
const fx = setupPreciousRender(renderer, scene, camera, { preset: 'night' });
const clock = new THREE.Clock();
function loop(): void { requestAnimationFrame(loop); const dt = clock.getDelta(); crowd.update(dt); controls.update(); fx.render(); (window as any).__ready = true; }
loop();
addEventListener('resize', () => { renderer.setSize(innerWidth, innerHeight); fx.setSize(innerWidth, innerHeight); camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix(); });
