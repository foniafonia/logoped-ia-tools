import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { setupPreciousRender } from './core/PreciousRender';
import { PlasticMaterialFactory } from './materials/PlasticMaterialFactory';
import { buildScarletCord } from './world/ScarletCord';

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(innerWidth, innerHeight); document.body.appendChild(renderer.domElement);
const scene = new THREE.Scene(); scene.background = new THREE.Color(0x2a2016);
const plastic = new PlasticMaterialFactory(); plastic.update({ roughness: 0.5, clearcoat: 0.3, envMapIntensity: 0.9 });
const floor = new THREE.Mesh(new THREE.PlaneGeometry(60,60), new THREE.MeshStandardMaterial({ color: 0xc7a878, roughness: 0.97 }));
floor.rotation.x=-Math.PI/2; floor.receiveShadow=true; scene.add(floor);
// muro con ventana (bloque) para colgar el cordon
const wall = new THREE.Mesh(new THREE.BoxGeometry(6,6,0.6), new THREE.MeshStandardMaterial({ color: 0xcaa15e, roughness: 0.9 }));
wall.position.set(0,3,-1.5); wall.receiveShadow=true; scene.add(wall);
const win = new THREE.Mesh(new THREE.BoxGeometry(1.4,1.2,0.3), new THREE.MeshStandardMaterial({ color: 0x3a2a1a }));
win.position.set(1.6,4.4,-1.15); scene.add(win);
const sun = new THREE.DirectionalLight(0xffe6c2, 2.0); sun.position.set(4,10,6); sun.castShadow=true; scene.add(sun);
scene.add(new THREE.HemisphereLight(0xffe6bf,0x6b4a2a,0.7));
scene.add(buildScarletCord(plastic, { top: { x: 1.6, y: 4.9, z: -1.15 }, length: 4.3, lean: 0.55 }));
const camera = new THREE.PerspectiveCamera(46, innerWidth/innerHeight, 0.1, 200); camera.position.set(2.5,3.5,6); camera.lookAt(1.2,2.6,-1);
const controls = new OrbitControls(camera, renderer.domElement); controls.target.set(1.2,2.6,-1); controls.update();
const fx = setupPreciousRender(renderer, scene, camera, { preset: 'interior' });
function loop(){ requestAnimationFrame(loop); controls.update(); fx.render(); (window as any).__ready=true; }
loop();
