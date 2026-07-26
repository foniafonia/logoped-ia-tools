import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { setupPreciousRender } from './core/PreciousRender';
import { PlasticMaterialFactory } from './materials/PlasticMaterialFactory';
import { createMinifigure, SPY_SKIN } from './characters/MinifigureFactory';
import { buildRelic } from './world/Relic';
import { mountStealth } from './ui/StealthMeter';
import { toast } from './ui/Toast';

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(innerWidth, innerHeight); document.body.appendChild(renderer.domElement);
const scene = new THREE.Scene(); scene.background = new THREE.Color(0x1e2740);
scene.fog = new THREE.Fog(0x1e2740, 18, 60);
const plastic = new PlasticMaterialFactory(); plastic.update({ roughness: 0.36, clearcoat: 0.55, envMapIntensity: 1.0 });
const floor = new THREE.Mesh(new THREE.PlaneGeometry(80,80), new THREE.MeshStandardMaterial({ color: 0x2a3652, roughness: 0.96 }));
floor.rotation.x = -Math.PI/2; floor.receiveShadow = true; scene.add(floor);
const moon = new THREE.DirectionalLight(0xcfe0ff, 1.3); moon.position.set(-6,12,5); moon.castShadow=true; moon.shadow.mapSize.set(1024,1024); scene.add(moon);
scene.add(new THREE.HemisphereLight(0x4a5878, 0x1a140c, 0.7));
const spy = createMinifigure(plastic, SPY_SKIN); spy.root.scale.setScalar(0.55); spy.root.position.set(-1.4,0,0.5); spy.root.rotation.y = 0.5; scene.add(spy.root);
const relic = buildRelic(plastic); relic.group.position.set(1.6,0,0); scene.add(relic.group);
const camera = new THREE.PerspectiveCamera(45, innerWidth/innerHeight, 0.1, 200); camera.position.set(0.5,3,6);
const controls = new OrbitControls(camera, renderer.domElement); controls.enableDamping=true; controls.target.set(0.4,1.2,0); controls.update();
const fx = setupPreciousRender(renderer, scene, camera, { exposure: 1.06, bloom: { strength: 0.4, threshold: 0.8 } });
const eye = mountStealth(document.body, { onSpotted: () => toast('¡Te han visto!', { icon: '👁️', variant: 'accent' }) });
eye.set(0.6);   // sospecha
function loop(){ requestAnimationFrame(loop); relic.update(0.016); spy.update(0.016,false); controls.update(); fx.render(); (window as any).__ready=true; }
loop();
addEventListener('resize',()=>{ renderer.setSize(innerWidth,innerHeight); fx.setSize(innerWidth,innerHeight); camera.aspect=innerWidth/innerHeight; camera.updateProjectionMatrix(); });
