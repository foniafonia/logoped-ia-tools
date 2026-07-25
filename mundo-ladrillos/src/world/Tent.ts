import * as THREE from 'three';
import { PlasticMaterialFactory } from '../materials/PlasticMaterialFactory';
import { createMinifigure, YOSHUA_SKIN, Minifigure } from '../characters/MinifigureFactory';

/**
 * INTERIOR vestido: la TIENDA de Yehoshúa (nómada, cálida). Para "reclutar
 * espías" (E10) y "trajes de sigilo" (E12): lona a rayas, alfombras, cojines,
 * mesa baja con mapa, un PERCHERO con los trajes de sigilo colgados, faroles y
 * Yehoshúa dentro. Habitación semiabierta (diorama), SIN horizonte.
 *
 * USO:  const tent = buildTent(scene, plastic, { yehoshua: true });  ... tent.dispose();
 */
export interface TentOptions { yehoshua?: boolean; suits?: boolean; background?: boolean; }
export interface TentHandle { group: THREE.Group; yehoshua?: Minifigure; dispose(): void; }

const CLOTH_A = 0xc9b083, CLOTH_B = 0xb9976a, WOOD = 0x6e4a2c, WOOD_D = 0x4e341f;

export function buildTent(scene: THREE.Scene, plastic: PlasticMaterialFactory, opts: TentOptions = {}): TentHandle {
  const group = new THREE.Group(); group.name = 'tent';
  if (opts.background !== false) { scene.background = new THREE.Color(0x1a140c); scene.fog = new THREE.Fog(0x1a140c, 28, 64); }

  const box = (w: number, h: number, d: number, color: number, x: number, y: number, z: number): THREE.Mesh => {
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), plastic.get(color)); m.position.set(x, y, z); m.castShadow = true; m.receiveShadow = true; group.add(m); return m;
  };
  const cyl = (rt: number, rb: number, h: number, color: number, x: number, y: number, z: number, seg = 10): THREE.Mesh => {
    const m = new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, seg), plastic.get(color)); m.position.set(x, y, z); m.castShadow = true; group.add(m); return m;
  };

  // suelo
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(22, 20), new THREE.MeshStandardMaterial({ color: 0x6a5236, roughness: 1 }));
  floor.rotation.x = -Math.PI / 2; floor.position.z = -1; floor.receiveShadow = true; group.add(floor);

  // LONA: techo piramidal de 6 lados + paredes de lona a rayas (back + laterales)
  const roof = new THREE.Mesh(new THREE.ConeGeometry(12, 6, 6), plastic.get(CLOTH_A)); roof.position.set(0, 9, -1); roof.rotation.y = Math.PI / 6; roof.castShadow = true; group.add(roof);
  cyl(0.25, 0.25, 12, WOOD_D, 0, 6, -1); // poste central
  // paredes de lona (rayas)
  for (let i = 0; i < 6; i++) {
    box(10, 6, 0.3, i % 2 ? CLOTH_A : CLOTH_B, 0, 3, -9);         // trasera (rayada por franjas)
  }
  box(0.3, 6, 16, CLOTH_B, -9, 3, -1); box(0.3, 6, 16, CLOTH_A, 9, 3, -1); // laterales
  // franjas de la pared trasera
  for (let x = -8; x <= 8; x += 2) box(0.9, 6, 0.34, x % 4 === 0 ? 0x8a5a2c : 0xd8b98a, x, 3, -8.82);

  // alfombras de kilim (simplificadas: bandas de color)
  const rug = box(9, 0.08, 7, 0x9c3b2a, -1, 0.05, 0); (rug.material as THREE.Material);
  box(6, 0.1, 4.4, 0xe7d3a6, -1, 0.09, 0); box(2.2, 0.12, 2.2, 0x2f6b5a, -1, 0.12, 0);

  // mesa baja + mapa + cojines
  cyl(1.5, 1.5, 0.5, WOOD, -1, 0.55, 0.5, 12);
  box(2.0, 0.06, 1.4, 0xe9dcc0, -1, 0.82, 0.5);   // mapa (pergamino)
  for (const [cx, cz, col] of [[-3.2, 0.5, 0x9c3b2a], [1.2, 0.8, 0x2f6b5a], [-1, 2.6, 0xcaa14a]] as Array<[number, number, number]>)
    box(1.4, 0.5, 1.4, col, cx, 0.28, cz);

  // PERCHERO con trajes de sigilo colgados (para E12)
  if (opts.suits !== false) {
    cyl(0.1, 0.1, 4.4, WOOD_D, 5.5, 2.2, -6); cyl(0.1, 0.1, 4.4, WOOD_D, 8.5, 2.2, -6);
    const bar = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 3.4, 8), plastic.get(WOOD)); bar.rotation.z = Math.PI / 2; bar.position.set(7, 4.2, -6); group.add(bar);
    for (const sx of [6.2, 7.8]) { box(1.1, 2.3, 0.3, 0x2c3550, sx, 2.9, -6); box(0.7, 0.7, 0.32, 0x3a4362, sx, 4.0, -5.95); } // traje + capucha
  }

  // baúl
  box(2.2, 1.2, 1.3, WOOD, 6.5, 0.6, 2.5); box(2.3, 0.3, 1.4, WOOD_D, 6.5, 1.25, 2.5);

  // faroles cálidos
  const lantern = (x: number, y: number, z: number): void => {
    box(0.4, 0.55, 0.4, 0x3a2a18, x, y, z);
    group.add(new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.36, 0.24), new THREE.MeshBasicMaterial({ color: 0xffb24d })).translateX(x).translateY(y).translateZ(z));
    const pl = new THREE.PointLight(0xffa64d, 7, 18, 2); pl.position.set(x, y, z + 0.2); group.add(pl);
  };
  lantern(-6, 4.5, -3); lantern(4.5, 4.2, -3);

  group.add(new THREE.HemisphereLight(0xffd9a0, 0x2a1c10, 1.05));
  group.add(new THREE.AmbientLight(0x6a4a2a, 0.5));

  let yehoshua: Minifigure | undefined;
  if (opts.yehoshua !== false) { yehoshua = createMinifigure(plastic, YOSHUA_SKIN); yehoshua.root.position.set(-1, 0, -3.5); scene.add(yehoshua.root); group.add(yehoshua.root); }

  scene.add(group);
  return {
    group, yehoshua,
    dispose(): void {
      scene.remove(group);
      group.traverse((o) => { const m = o as THREE.Mesh; if (m.geometry) m.geometry.dispose(); const mm = m.material as THREE.Material | THREE.Material[] | undefined; if (Array.isArray(mm)) mm.forEach((x) => x.dispose()); else if (mm) mm.dispose(); });
      if (scene.fog) scene.fog = null;
    }
  };
}
