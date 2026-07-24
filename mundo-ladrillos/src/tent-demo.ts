import * as THREE from 'three';
import { PlasticMaterialFactory } from './materials/PlasticMaterialFactory';
import { createMinifigure, SPY_CAMP_SKIN } from './characters/MinifigureFactory';
import { buildTent } from './world/Tent';

const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
renderer.setPixelRatio(1); renderer.setSize(innerWidth, innerHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace; renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.5; renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.body.appendChild(renderer.domElement);

const scene = new THREE.Scene();
const plastic = new PlasticMaterialFactory();
const key = new THREE.DirectionalLight(0xffe2b0, 0.7); key.position.set(3, 12, 12); key.castShadow = true;
key.shadow.mapSize.set(1024, 1024); key.shadow.camera.left = -14; key.shadow.camera.right = 14; key.shadow.camera.top = 14; key.shadow.camera.bottom = -6;
scene.add(key);

const tent = buildTent(scene, plastic, { yehoshua: true, suits: true });
const spy = createMinifigure(plastic, SPY_CAMP_SKIN); spy.root.position.set(2.5, 0, 2.5); spy.root.rotation.y = -2.4; scene.add(spy.root);

const camera = new THREE.PerspectiveCamera(50, innerWidth / innerHeight, 0.1, 200);
camera.position.set(1.5, 3.8, 12.5); camera.lookAt(-0.5, 2.6, -4);

let t = 0;
function loop(): void { requestAnimationFrame(loop); t += 0.016; spy.update(0.016, false); tent.yehoshua?.update(0.016, false); renderer.render(scene, camera); (window as any).__ready = true; }
loop();
addEventListener('resize', () => { renderer.setSize(innerWidth, innerHeight); camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix(); });
