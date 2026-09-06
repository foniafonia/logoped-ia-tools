/**
 * EJEMPLO MÍNIMO — una figura en pantalla, nada más.
 * 40 líneas. Copia este patrón para meter el muñequero en otro juego.
 */
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { PlasticMaterialFactory } from '../src/materials/PlasticMaterialFactory';
import { createMinifigure, YOSHUA_SKIN } from '../src/characters/MinifigureFactory';

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.setSize(innerWidth, innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
// Tono: sin esto el plástico sale apagado y los colores no cuadran con la hoja
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 0.92;
document.body.appendChild(renderer.domElement);

const scene = new THREE.Scene();
scene.background = new THREE.Color(0xffffff);

// IBL: SIN ESTO EL PLÁSTICO NO BRILLA. Es la mitad del acabado.
const pmrem = new THREE.PMREMGenerator(renderer);
scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.03).texture;

// Luz de producto: key + fill + dos rim. Sin esto el muñeco se ve plano.
scene.add(new THREE.HemisphereLight(0xffffff, 0xd8d8dc, 0.5));
const key = new THREE.DirectionalLight(0xfffaf2, 1.85);
key.position.set(-4.5, 9.5, 7.5); key.castShadow = true;
key.shadow.mapSize.set(2048, 2048); key.shadow.radius = 9; key.shadow.bias = -0.0004;
scene.add(key);
const fill = new THREE.DirectionalLight(0xeef2ff, 0.62); fill.position.set(6, 3.5, 5); scene.add(fill);
const rim = new THREE.DirectionalLight(0xffffff, 1.15); rim.position.set(2.5, 5.5, -7); scene.add(rim);
const rim2 = new THREE.DirectionalLight(0xffffff, 0.5); rim2.position.set(-5, 3, -5); scene.add(rim2);

// Suelo que solo recoge la sombra de contacto
const floor = new THREE.Mesh(new THREE.PlaneGeometry(80, 80), new THREE.ShadowMaterial({ opacity: 0.3 }));
floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; scene.add(floor);

// --- LA FIGURA ---
const plastic = new PlasticMaterialFactory();
plastic.update({ roughness: 0.32, clearcoat: 0.55, envMapIntensity: 1.15 });
const yeho = createMinifigure(plastic, YOSHUA_SKIN);
// userData.noShadow marca la pelusa: si le pones sombra salen manchas
yeho.root.traverse((o) => { if ((o as THREE.Mesh).isMesh && !o.userData.noShadow) o.castShadow = true; });
scene.add(yeho.root);

// Lente larga (≈85 mm): con fov ancho las proporciones se deforman
const camera = new THREE.PerspectiveCamera(20, innerWidth / innerHeight, 0.1, 200);
camera.position.set(0, 2.8, 20);
camera.lookAt(0, 2.5, 0);

const clock = new THREE.Clock();
(function loop() {
  requestAnimationFrame(loop);
  yeho.update(Math.min(clock.getDelta(), 0.05), true, 1);   // true = caminando
  yeho.root.rotation.y += 0.004;
  renderer.render(scene, camera);
})();

addEventListener('resize', () => {
  renderer.setSize(innerWidth, innerHeight);
  camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix();
});
