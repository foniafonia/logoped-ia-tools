import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { setupPreciousRender } from './core/PreciousRender';
import { PlasticMaterialFactory } from './materials/PlasticMaterialFactory';
import { tiledTexture } from './materials/tiling';
import { texSand } from './assets/texSand';
import { texKilim } from './assets/texKilim';
import { texWood } from './assets/texWood';
import { buildFirePit, buildCrateStack, buildSackPile } from './world/Clutter';
import { createMinifigure, villagerSkin } from './characters/MinifigureFactory';

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(innerWidth, innerHeight); document.body.appendChild(renderer.domElement);
const scene = new THREE.Scene(); scene.background = new THREE.Color(0x1a2340);
scene.fog = new THREE.Fog(0x1a2340, 16, 55);
const plastic = new PlasticMaterialFactory(); plastic.update({ roughness: 0.34, clearcoat: 0.5, envMapIntensity: 0.8 });
// suelo de arena
const floor = new THREE.Mesh(new THREE.PlaneGeometry(60,60), new THREE.MeshStandardMaterial({ map: tiledTexture(texSand, 16), roughness: 0.98 }));
floor.rotation.x=-Math.PI/2; floor.receiveShadow=true; scene.add(floor);
// alfombra kilim
const rug = new THREE.Mesh(new THREE.PlaneGeometry(3.4,2.2), new THREE.MeshStandardMaterial({ map: tiledTexture(texKilim, 1), roughness: 0.9 }));
rug.rotation.x=-Math.PI/2; rug.position.set(-2.4,0.02,1.4); rug.receiveShadow=true; scene.add(rug);
// tarima de madera
const deck = new THREE.Mesh(new THREE.BoxGeometry(3,0.18,2.2), new THREE.MeshStandardMaterial({ map: tiledTexture(texWood, 2), roughness: 0.85 }));
deck.position.set(2.6,0.09,1.2); deck.castShadow=true; deck.receiveShadow=true; scene.add(deck);
const moon = new THREE.DirectionalLight(0xbcd0ff, 0.7); moon.position.set(-6,12,4); moon.castShadow=true; moon.shadow.mapSize.set(1024,1024); scene.add(moon);
scene.add(new THREE.HemisphereLight(0x3a4870, 0x140f08, 0.5));
scene.add(buildFirePit(plastic, { x: 0, z: -0.5 }));
scene.add(buildCrateStack(plastic, { x: 3, z: -1.6, yaw: 0.4 }));
scene.add(buildSackPile(plastic, { x: -2.6, z: -1.2 }));
const v = createMinifigure(plastic, villagerSkin(3)); v.root.scale.setScalar(0.5); v.root.position.set(1.4,0,0.8); v.root.rotation.y=-0.8; scene.add(v.root);
const camera = new THREE.PerspectiveCamera(48, innerWidth/innerHeight, 0.1, 200); camera.position.set(1,4,8); camera.lookAt(0,1,0);
const controls = new OrbitControls(camera, renderer.domElement); controls.enableDamping=true; controls.target.set(0,1,0); controls.update();
const fx = setupPreciousRender(renderer, scene, camera, { preset: 'night' });
function loop(){ requestAnimationFrame(loop); v.update(0.016,false); controls.update(); fx.render(); (window as any).__ready=true; }
loop();
addEventListener('resize',()=>{ renderer.setSize(innerWidth,innerHeight); fx.setSize(innerWidth,innerHeight); camera.aspect=innerWidth/innerHeight; camera.updateProjectionMatrix(); });
