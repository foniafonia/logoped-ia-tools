import * as THREE from 'three';
import { setupPreciousRender } from './core/PreciousRender';
import { PlasticMaterialFactory } from './materials/PlasticMaterialFactory';
import { tiledTexture } from './materials/tiling';
import { texEarth } from './assets/texEarth';
import { texRock } from './assets/texRock';
import { texThatch } from './assets/texThatch';
import { buildPalm } from './world/Clutter';

/**
 * Demo "terreno de la marcha": suelo de TIERRA agrietada + peñascos de ROCA +
 * una choza con techo de PALMA (paja), todo con texturas reales de Higgsfield
 * tileadas (Regla Nº1: nada de planos pelados). Base para exteriores áridos y
 * la marcha alrededor de Jericó.
 */
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(innerWidth, innerHeight);
document.body.appendChild(renderer.domElement);

const scene = new THREE.Scene();
scene.background = new THREE.Color(0xcbd8e6);
scene.fog = new THREE.Fog(0xcbd8e6, 38, 95);

const plastic = new PlasticMaterialFactory();
plastic.update({ roughness: 0.4, clearcoat: 0.4, envMapIntensity: 0.9 });

// suelo de tierra agrietada
const floor = new THREE.Mesh(
  new THREE.PlaneGeometry(120, 120),
  new THREE.MeshStandardMaterial({ map: tiledTexture(texEarth, 26), roughness: 0.98 })
);
floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; scene.add(floor);

const sun = new THREE.DirectionalLight(0xfff0d4, 2.2);
sun.position.set(14, 20, 6); sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048);
scene.add(sun);
scene.add(new THREE.HemisphereLight(0xcfe0ff, 0x7a6647, 0.8));

// peñascos de roca (dodecaedros texturizados, tamaños variados)
const rockMat = new THREE.MeshStandardMaterial({ map: tiledTexture(texRock, 1), roughness: 0.95 });
for (const [x, z, s] of [[-7, -3, 1.4], [-5.5, -4.5, 0.9], [8, -5, 1.8], [6.5, 2, 1.1], [-9, 4, 1.3]] as const) {
  const rock = new THREE.Mesh(new THREE.DodecahedronGeometry(s), rockMat);
  rock.position.set(x, s * 0.55, z);
  rock.rotation.set(x, z, s); rock.scale.y = 0.8;
  rock.castShadow = true; rock.receiveShadow = true; scene.add(rock);
}

// choza con techo de palma (cubo de adobe + pirámide de paja)
const hut = new THREE.Group();
const wallTex = tiledTexture(texEarth, 2);
const walls = new THREE.Mesh(new THREE.BoxGeometry(3.4, 2.4, 3.4),
  new THREE.MeshStandardMaterial({ map: wallTex, color: 0xd9c19a, roughness: 0.95 }));
walls.position.y = 1.2; walls.castShadow = true; walls.receiveShadow = true; hut.add(walls);
const roof = new THREE.Mesh(new THREE.ConeGeometry(3.0, 1.8, 4),
  new THREE.MeshStandardMaterial({ map: tiledTexture(texThatch, 2), roughness: 1.0 }));
roof.position.y = 3.3; roof.rotation.y = Math.PI / 4; roof.castShadow = true; hut.add(roof);
const doorway = new THREE.Mesh(new THREE.BoxGeometry(1.0, 1.6, 0.1),
  new THREE.MeshStandardMaterial({ color: 0x3a2412, roughness: 1 }));
doorway.position.set(0, 0.8, 1.71); hut.add(doorway);
hut.position.set(2, 0, 3); scene.add(hut);

// algo de vida
scene.add(buildPalm(plastic, { x: -8, z: 6, height: 5.0 }));
scene.add(buildPalm(plastic, { x: 9, z: 5, height: 4.4 }));

const camera = new THREE.PerspectiveCamera(50, innerWidth / innerHeight, 0.1, 200);
camera.position.set(-1, 5.5, 15); camera.lookAt(1, 1.6, 2);

const fx = setupPreciousRender(renderer, scene, camera, { exposure: 1.05, preset: 'day' });

function loop(): void { requestAnimationFrame(loop); fx.render(); (window as any).__ready = true; }
loop();
addEventListener('resize', () => {
  renderer.setSize(innerWidth, innerHeight);
  fx.setSize(innerWidth, innerHeight);
  camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix();
});
