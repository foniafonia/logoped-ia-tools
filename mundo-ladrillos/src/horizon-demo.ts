import * as THREE from 'three';
import { PlasticMaterialFactory } from './materials/PlasticMaterialFactory';
import { createMinifigure, SPY_SKIN } from './characters/MinifigureFactory';
import { buildHorizon, HorizonMode } from './world/Horizon';

/** Demo del helper buildHorizon: horizon-demo.html?m=desierto-atardecer */
const mode = (new URLSearchParams(location.search).get('m') ?? 'desierto-atardecer') as HorizonMode;
const night = mode.includes('noche');

const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
renderer.setPixelRatio(1); renderer.setSize(innerWidth, innerHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace; renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = night ? 1.5 : 1.15; renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.body.appendChild(renderer.domElement);

const scene = new THREE.Scene();
const plastic = new PlasticMaterialFactory();

// luces según día/noche
scene.add(new THREE.HemisphereLight(night ? 0x8a90c0 : 0xffe6b8, night ? 0x3a3020 : 0x8a7860, night ? 1.5 : 1.3));
if (night) scene.add(new THREE.AmbientLight(0x6a6488, 0.5));
const sun = new THREE.DirectionalLight(night ? 0xc6d0ff : 0xffd39a, night ? 1.2 : 2.4);
sun.position.set(-30, 34, 12); sun.castShadow = true;
sun.shadow.mapSize.set(1024, 1024); sun.shadow.camera.left = -20; sun.shadow.camera.right = 20; sun.shadow.camera.top = 20; sun.shadow.camera.bottom = -8;
scene.add(sun);

// suelo
const floor = new THREE.Mesh(new THREE.PlaneGeometry(500, 500), new THREE.MeshStandardMaterial({ color: night ? 0x5a5040 : 0xdcc390, roughness: 1 }));
floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; scene.add(floor);

// ★ una sola línea: el horizonte
const horizon = buildHorizon(scene, mode);
void horizon;

// personaje de escala
const spy = createMinifigure(plastic, SPY_SKIN); spy.root.position.set(-2, 0, 4); spy.root.rotation.y = 0.5; scene.add(spy.root);

const camera = new THREE.PerspectiveCamera(50, innerWidth / innerHeight, 0.1, 600);
camera.position.set(6, 6.5, 24); camera.lookAt(0, 5, -60);
(document.getElementById('tag')!).textContent = 'buildHorizon("' + mode + '")';

let t = 0;
function loop(): void { requestAnimationFrame(loop); t += 0.016; spy.update(0.016, false); renderer.render(scene, camera); (window as any).__ready = true; }
loop();
addEventListener('resize', () => { renderer.setSize(innerWidth, innerHeight); camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix(); });
