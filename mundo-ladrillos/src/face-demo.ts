import * as THREE from 'three';
import { setupPreciousRender } from './core/PreciousRender';
import { PlasticMaterialFactory } from './materials/PlasticMaterialFactory';
import { createMinifigure, villagerSkin, type Emotion } from './characters/MinifigureFactory';

/**
 * Contact-sheet de EXPRESIONES: una cabeza por emoción, en rejilla y etiquetada.
 * Sirve para ver de un vistazo el repertorio de caras (y que peguen entre sí).
 */
const EMOTIONS: Emotion[] = [
  'happy', 'joyful', 'neutral', 'worried', 'sad', 'surprised',
  'scared', 'stern', 'angry', 'alert', 'sly'
];

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(innerWidth, innerHeight);
document.body.appendChild(renderer.domElement);

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x2a2418);

const plastic = new PlasticMaterialFactory();
plastic.update({ roughness: 0.3, clearcoat: 0.6, envMapIntensity: 1.3 });

const floor = new THREE.Mesh(
  new THREE.PlaneGeometry(60, 60),
  new THREE.MeshStandardMaterial({ color: 0x4a3f2c, roughness: 0.95 })
);
floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; scene.add(floor);
scene.add(new THREE.HemisphereLight(0xfff0d8, 0x40382a, 0.7));
const key = new THREE.DirectionalLight(0xffd9a0, 2.4);
key.position.set(4, 9, 8); key.castShadow = true; key.shadow.mapSize.set(2048, 2048);
scene.add(key);

// etiqueta de texto como sprite (canvas)
function label(text: string, x: number, y: number, z: number): void {
  const c = document.createElement('canvas'); c.width = 256; c.height = 64;
  const g = c.getContext('2d')!;
  g.fillStyle = '#f4e9d2'; g.font = 'bold 34px system-ui, sans-serif';
  g.textAlign = 'center'; g.textBaseline = 'middle';
  g.fillText(text, 128, 34);
  const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace;
  const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true }));
  sp.position.set(x, y, z); sp.scale.set(1.6, 0.4, 1);
  scene.add(sp);
}

// rejilla 4 columnas, filas ESCALONADas (foto de clase: atrás más alto y más lejos)
const COLS = 4, DX = 3.0, DZ = 3.0, DY = 2.1;
EMOTIONS.forEach((emo, i) => {
  const col = i % COLS, row = Math.floor(i / COLS);
  const inRow = Math.min(COLS, EMOTIONS.length - row * COLS); // centra filas incompletas
  const x = (col - (inRow - 1) / 2) * DX;
  const z = -row * DZ; const y = row * DY;
  const fig = createMinifigure(plastic, { ...villagerSkin(2 + i), emotion: emo });
  fig.root.position.set(x, y, z);
  scene.add(fig.root);
  label(emo, x, y + 5.15, z);
});

const camera = new THREE.PerspectiveCamera(40, innerWidth / innerHeight, 0.1, 200);
camera.position.set(0, 8.5, 15); camera.lookAt(0, 5.2, -DZ);

const fx = setupPreciousRender(renderer, scene, camera, { exposure: 1.0, bloom: { strength: 0.22, threshold: 0.9 } });

function loop(): void { requestAnimationFrame(loop); fx.render(); (window as any).__ready = true; }
loop();
addEventListener('resize', () => {
  renderer.setSize(innerWidth, innerHeight);
  fx.setSize(innerWidth, innerHeight);
  camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix();
});
