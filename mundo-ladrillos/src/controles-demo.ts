import * as THREE from 'three';
import { setupPreciousRender } from './core/PreciousRender';
import { PlasticMaterialFactory } from './materials/PlasticMaterialFactory';
import { createMinifigure, YOSHUA_SKIN } from './characters/MinifigureFactory';
import { buildWell } from './world/StreetProps';
import { addBackdrop, backdropRails } from './world/Backdrop';
import { bgCampamento } from './assets/bgCampamento';
import { mountControls } from './ui/Controls';
import { mountDialogue } from './ui/DialogueBox';

/**
 * Demo de CONTROLES: mueve a la minifigura con el joystick (móvil) o WASD/flechas,
 * mira hacia donde anda y anima el paso. Cerca del pozo aparece "Pulsa E — Hablar";
 * al interactuar salta un diálogo. `forceTouch:true` para ver el joystick aquí.
 */
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(innerWidth, innerHeight);
document.body.appendChild(renderer.domElement);

const scene = new THREE.Scene();
addBackdrop(scene, bgCampamento, { skyColor: 0xd8c090 });
scene.fog = new THREE.Fog(0xdcb47f, 34, 100);

const plastic = new PlasticMaterialFactory();
plastic.update({ roughness: 0.34, clearcoat: 0.55, envMapIntensity: 1.0 });

const floor = new THREE.Mesh(new THREE.PlaneGeometry(120, 120), new THREE.MeshStandardMaterial({ color: 0xc9a878, roughness: 0.96 }));
floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; scene.add(floor);

const sun = new THREE.DirectionalLight(0xffe8c8, 1.7); sun.position.set(5, 12, 6);
sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048); scene.add(sun);
scene.add(new THREE.HemisphereLight(0xffe6bf, 0x6b4a2a, 0.6));

// Objeto interactuable: el pozo
const well = buildWell(plastic, { x: 3.5, z: -1 });
scene.add(well);
const WELL = new THREE.Vector3(3.5, 0, -1);

// Jugador
const player = createMinifigure(plastic, YOSHUA_SKIN);
player.root.scale.setScalar(0.5);
scene.add(player.root);
const pos = new THREE.Vector3(-2, 0, 3);
let yaw = 0;

const camera = new THREE.PerspectiveCamera(48, innerWidth / innerHeight, 0.1, 300);
camera.position.set(0, 7.5, 12); camera.lookAt(0, 1.5, 0);
const fx = setupPreciousRender(renderer, scene, camera, { exposure: 1.05, bloom: { strength: 0.28, threshold: 0.86 } });
void backdropRails;

// Controles
let mvx = 0, mvy = 0;
const controls = mountControls(document.body, {
  forceTouch: true,          // muestra el joystick también en escritorio (demo)
  onMove: (x, y) => { mvx = x; mvy = y; },
  onInteract: () => {
    if (pos.distanceTo(WELL) < 2.4) {
      dlg.play([{ speaker: 'Yehoshúa', text: 'El pozo del campamento. Bebe y descansa.', color: '#4a7fd0' }]);
    }
  },
  onAction: () => { /* salto: gancho para el LEAD */ }
});
const dlg = mountDialogue(document.body);

const SPEED = 6;
const clock = new THREE.Clock();
function loop(): void {
  requestAnimationFrame(loop);
  const dt = Math.min(0.05, clock.getDelta());
  const moving = Math.hypot(mvx, mvy) > 0.05;
  if (moving) {
    pos.x += mvx * SPEED * dt;
    pos.z += -mvy * SPEED * dt;
    pos.x = Math.max(-10, Math.min(10, pos.x));
    pos.z = Math.max(-6, Math.min(8, pos.z));
    yaw = Math.atan2(mvx, -mvy); // mira hacia el avance
  }
  player.root.position.set(pos.x, 0, pos.z);
  player.root.rotation.y = yaw;
  player.update(dt, moving, SPEED);

  // prompt contextual cerca del pozo
  controls.setPrompt(pos.distanceTo(WELL) < 2.4 ? 'Hablar' : null);

  fx.render();
  (window as any).__ready = true;
}
loop();
addEventListener('resize', () => {
  renderer.setSize(innerWidth, innerHeight);
  fx.setSize(innerWidth, innerHeight);
  camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix();
});
