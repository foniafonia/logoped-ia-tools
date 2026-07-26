import * as THREE from 'three';
import { PlasticMaterialFactory } from '../materials/PlasticMaterialFactory';
import { createMinifigure, RAHAB_SKIN, Minifigure } from '../characters/MinifigureFactory';

/**
 * INTERIOR vestido: la TABERNA "Restaurante de Rahab" (habitación CERRADA, sin
 * horizonte). Paredes de arenisca, barra con vasijas, estantes, faroles cálidos,
 * alfombras de kilim, el cartel y Rahab detrás de la barra. Cozy y cálido.
 *
 * USO:
 *   import { buildTavern } from '../world/Tavern';
 *   const tav = buildTavern(scene, plastic, { rahab: true });
 *   // ...al salir: tav.dispose();
 *
 * Da su propia luz cálida (ambient + faroles). La escena puede añadir un key
 * suave. Es una sala abierta por delante (tipo diorama) para ver dentro.
 */

export interface TavernOptions { rahab?: boolean; background?: boolean; }
export interface TavernHandle { group: THREE.Group; rahab?: Minifigure; dispose(): void; }

const SAND = 0xcdb082, SAND_D = 0xb2966a, WOOD = 0x6e4a2c, WOOD_D = 0x4e341f;

function kilimTexture(): THREE.Texture {
  const c = document.createElement('canvas'); c.width = 256; c.height = 320; const x = c.getContext('2d')!;
  x.fillStyle = '#e7d3a6'; x.fillRect(0, 0, 256, 320);
  x.strokeStyle = '#9c3b2a'; x.lineWidth = 12; x.strokeRect(12, 12, 232, 296);
  x.strokeStyle = '#caa14a'; x.lineWidth = 6; x.strokeRect(26, 26, 204, 268);
  x.fillStyle = '#9c3b2a'; x.font = 'bold 26px Georgia,serif'; x.textAlign = 'center';
  x.fillText('RESTAURANTE', 128, 70); x.fillText('DE RAHAB', 128, 104);
  for (let ry = 150; ry < 300; ry += 40) for (let rx = 54; rx < 210; rx += 40) {
    x.fillStyle = ((rx + ry) % 80 === 0) ? '#2f6b5a' : '#9c3b2a';
    x.beginPath(); x.moveTo(rx, ry - 12); x.lineTo(rx + 12, ry); x.lineTo(rx, ry + 12); x.lineTo(rx - 12, ry); x.closePath(); x.fill();
  }
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}

export function buildTavern(scene: THREE.Scene, plastic: PlasticMaterialFactory, opts: TavernOptions = {}): TavernHandle {
  const group = new THREE.Group(); group.name = 'tavern';
  if (opts.background !== false) { scene.background = new THREE.Color(0x14100a); scene.fog = new THREE.Fog(0x14100a, 30, 70); }

  const box = (w: number, h: number, d: number, color: number, x: number, y: number, z: number): THREE.Mesh => {
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), plastic.get(color)); m.position.set(x, y, z); m.castShadow = true; m.receiveShadow = true; group.add(m); return m;
  };
  const glow = (w: number, h: number, d: number, color: number, x: number, y: number, z: number): THREE.Mesh => {
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), new THREE.MeshBasicMaterial({ color })); m.position.set(x, y, z); group.add(m); return m;
  };

  // ---- SALA (suelo, paredes traseras y laterales, techo con vigas) ----
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(26, 22), new THREE.MeshStandardMaterial({ color: 0x5a4632, roughness: 1 }));
  floor.rotation.x = -Math.PI / 2; floor.position.z = -2; floor.receiveShadow = true; group.add(floor);
  box(26, 13, 0.6, SAND, 0, 6.5, -11);           // pared trasera
  box(0.6, 13, 20, SAND_D, -12.7, 6.5, -1);      // pared izq
  box(0.6, 13, 20, SAND_D, 12.7, 6.5, -1);       // pared der
  for (let x = -10; x <= 10; x += 4) box(1.2, 0.8, 20, WOOD_D, x, 12.4, -1); // vigas del techo

  // arco a la calle (con un pelín de noche fuera)
  box(4.2, 0.8, 0.7, SAND_D, 8, 8.2, -10.7);
  glow(3, 5.2, 0.2, 0x24304e, 8, 4.6, -10.55);   // hueco azul noche

  // ---- BARRA de la taberna ----
  box(15, 2.2, 1.8, WOOD, -1.5, 1.1, -5.5);       // cuerpo de la barra
  box(15.4, 0.35, 2.2, WOOD_D, -1.5, 2.3, -5.5);  // encimera
  // vasijas y tazas humeantes en la barra
  const cupCol = [0xb5673a, 0x8a5a2c, 0xcaa14a, 0x9a9184];
  for (let i = 0; i < 6; i++) {
    const cx = -7 + i * 2.1;
    const cup = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.24, 0.5, 10), plastic.get(cupCol[i % 4])); cup.position.set(cx, 2.75, -4.9); cup.castShadow = true; group.add(cup);
  }
  const jar = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.55, 1.1, 10), plastic.get(0xb5673a)); jar.position.set(5.5, 3.05, -5); jar.castShadow = true; group.add(jar);

  // ---- ESTANTES con vasijas en la pared trasera ----
  for (const sy of [4.4, 7.0]) {
    box(11, 0.3, 1.2, WOOD_D, -3, sy, -10.2);
    for (let i = 0; i < 6; i++) { const v = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.36, 0.8, 8), plastic.get(cupCol[(i + 1) % 4])); v.position.set(-7.5 + i * 1.8, sy + 0.55, -10.2); v.castShadow = true; group.add(v); }
  }

  // ---- CARTEL "Restaurante de Rahab" (kilim) en la pared ----
  const banner = new THREE.Mesh(new THREE.BoxGeometry(4.4, 5.4, 0.16), new THREE.MeshStandardMaterial({ map: kilimTexture(), roughness: 0.95 }));
  banner.position.set(-8.5, 7.2, -10.55); banner.castShadow = true; group.add(banner);

  // alfombra de kilim en el suelo
  const rug = new THREE.Mesh(new THREE.PlaneGeometry(6, 8), new THREE.MeshStandardMaterial({ map: kilimTexture(), roughness: 0.98 }));
  rug.rotation.x = -Math.PI / 2; rug.position.set(0, 0.02, 1); group.add(rug);

  // ---- FAROLES cálidos (colgados + de pared) con luz ----
  const lantern = (x: number, y: number, z: number, power = 8): void => {
    box(0.4, 0.6, 0.4, 0x3a2a18, x, y, z);
    glow(0.26, 0.4, 0.26, 0xffb24d, x, y, z);
    const pl = new THREE.PointLight(0xffa64d, power, 20, 2); pl.position.set(x, y - 0.1, z + 0.3); group.add(pl);
  };
  lantern(-8, 8.5, -3); lantern(6, 8.8, -3); lantern(-1.5, 5.5, -8, 6); lantern(9, 6, -2, 5);

  // ---- mesa + taburetes delante de la barra (donde se sientan los espías) ----
  const table = new THREE.Mesh(new THREE.CylinderGeometry(1.4, 1.4, 0.3, 12), plastic.get(WOOD)); table.position.set(-1, 2.1, 1.5); table.castShadow = true; group.add(table);
  group.add(new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.3, 2, 8), plastic.get(WOOD_D)).translateX(-1).translateY(1).translateZ(1.5));
  for (const [sx, sz] of [[-3, 2], [1, 2.4], [-1, 3.4]] as Array<[number, number]>) {
    const st = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.5, 1.3, 10), plastic.get(WOOD)); st.position.set(sx, 0.65, sz); st.castShadow = true; group.add(st);
  }
  // macetas en las esquinas
  const pot = (x: number, z: number): void => {
    group.add(new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.35, 0.8, 10), plastic.get(0xb5673a)).translateX(x).translateY(0.4).translateZ(z));
    for (let k = 0; k < 4; k++) { const l = box(0.3, 0.9, 0.14, 0x3f7a46, x + (k - 1.5) * 0.14, 1.1, z); l.rotation.z = (k - 1.5) * 0.3; }
  };
  pot(-11, -8); pot(11, -8);

  // ---- luz ambiente cálida propia del interior ----
  group.add(new THREE.HemisphereLight(0xffd9a0, 0x2a1c10, 1.1));
  group.add(new THREE.AmbientLight(0x6a4a2a, 0.5));

  // ---- RAHAB detrás de la barra ----
  let rahab: Minifigure | undefined;
  if (opts.rahab !== false) {
    rahab = createMinifigure(plastic, RAHAB_SKIN);
    rahab.root.position.set(-1.5, 0, -7.5); rahab.root.rotation.y = 0; group.add(rahab.root);
  }

  scene.add(group);
  return {
    group, rahab,
    dispose(): void {
      scene.remove(group);
      group.traverse((o) => { const m = o as THREE.Mesh; if (m.geometry) m.geometry.dispose(); const mm = m.material as THREE.Material | THREE.Material[] | undefined; if (Array.isArray(mm)) mm.forEach((x) => x.dispose()); else if (mm) mm.dispose(); });
      if (scene.fog) scene.fog = null;
    }
  };
}
