import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { setupPreciousRender } from './core/PreciousRender';
import { tiledTexture } from './materials/tiling';
import { texSand } from './assets/texSand';
import { texWall } from './assets/texWall';
import { createMinifigure, YOSHUA_SKIN } from './characters/MinifigureFactory';
import { PlasticMaterialFactory } from './materials/PlasticMaterialFactory';

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(innerWidth, innerHeight); document.body.appendChild(renderer.domElement);
const scene = new THREE.Scene(); scene.background = new THREE.Color(0xbcd0e8);
const plastic = new PlasticMaterialFactory(); plastic.update({ roughness: 0.3, clearcoat: 0.6, envMapIntensity: 1.0 });
// suelo con textura de arena (tileada)
const floor = new THREE.Mesh(new THREE.PlaneGeometry(40,40),
  new THREE.MeshStandardMaterial({ map: tiledTexture(texSand, 14), roughness: 0.98 }));
floor.rotation.x=-Math.PI/2; floor.receiveShadow=true; scene.add(floor);
// muro con textura de sillería (tileada)
const wall = new THREE.Mesh(new THREE.BoxGeometry(16,5,0.6),
  new THREE.MeshStandardMaterial({ map: tiledTexture(texWall, 6), roughness: 0.9 }));
wall.position.set(0,2.5,-4); wall.castShadow=true; wall.receiveShadow=true; scene.add(wall);
const sun = new THREE.DirectionalLight(0xffe6c0, 2.0); sun.position.set(5,10,6); sun.castShadow=true; sun.shadow.mapSize.set(2048,2048); scene.add(sun);
scene.add(new THREE.HemisphereLight(0xdfeeff,0x6b4a2a,0.7));
const fig = createMinifigure(plastic, YOSHUA_SKIN); fig.root.position.set(0,0,0.5); scene.add(fig.root);
const camera = new THREE.PerspectiveCamera(46, innerWidth/innerHeight, 0.1, 200); camera.position.set(3,4.2,8); camera.lookAt(0,2,-2);
const controls = new OrbitControls(camera, renderer.domElement); controls.enableDamping=true; controls.target.set(0,2,-2); controls.update();
const fx = setupPreciousRender(renderer, scene, camera, { preset: 'day' });
function loop(){ requestAnimationFrame(loop); fig.update(0.016,false); controls.update(); fx.render(); (window as any).__ready=true; }
loop();
addEventListener('resize',()=>{ renderer.setSize(innerWidth,innerHeight); fx.setSize(innerWidth,innerHeight); camera.aspect=innerWidth/innerHeight; camera.updateProjectionMatrix(); });
