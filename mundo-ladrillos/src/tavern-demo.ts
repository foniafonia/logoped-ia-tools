import * as THREE from 'three';
import { PlasticMaterialFactory } from './materials/PlasticMaterialFactory';
import { createMinifigure, SPY_CAMP_SKIN } from './characters/MinifigureFactory';
import { buildTavern } from './world/Tavern';

const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
renderer.setPixelRatio(1); renderer.setSize(innerWidth, innerHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace; renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.5; renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.body.appendChild(renderer.domElement);

const scene = new THREE.Scene();
const plastic = new PlasticMaterialFactory();

// key suave desde el frente (el resto de luz la da la propia taberna)
const key = new THREE.DirectionalLight(0xffe2b0, 0.7); key.position.set(3, 12, 12); key.castShadow = true;
key.shadow.mapSize.set(1024, 1024); key.shadow.camera.left = -16; key.shadow.camera.right = 16; key.shadow.camera.top = 16; key.shadow.camera.bottom = -8;
scene.add(key);

const tav = buildTavern(scene, plastic, { rahab: true });
void tav;

// un espía sentado/parado en la barra (escala)
const spy = createMinifigure(plastic, SPY_CAMP_SKIN); spy.root.position.set(-3, 0, 2); spy.root.rotation.y = Math.PI; scene.add(spy.root);

const camera = new THREE.PerspectiveCamera(52, innerWidth / innerHeight, 0.1, 200);
camera.position.set(1, 7.5, 15); camera.lookAt(-1, 4.5, -5);

let t = 0;
function loop(): void { requestAnimationFrame(loop); t += 0.016; spy.update(0.016, false); tav.rahab?.update(0.016, false); renderer.render(scene, camera); (window as any).__ready = true; }
loop();
addEventListener('resize', () => { renderer.setSize(innerWidth, innerHeight); camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix(); });
