import * as THREE from 'three';
import { PlasticMaterialFactory } from '../materials/PlasticMaterialFactory';

/**
 * MOMENTO "WOW": el Jordán PARTIDO — dos muros de agua translúcida con PECES
 * dentro y un cauce seco por el medio para cruzar (fiel al frame de la peli).
 * Reutilizable. Devuelve update(dt) para animar peces/brillo del agua.
 *
 * USO:
 *   import { buildPartedRiver } from '../world/PartedRiver';
 *   const river = buildPartedRiver(scene, plastic);
 *   // en el loop: river.update(dt);
 *   // al salir:   river.dispose();
 */

export interface PartedRiverHandle { group: THREE.Group; update(dt: number): void; dispose(): void; }

const FISH_COLORS = [0xff7a3d, 0x2f8f8f, 0xf0c33a, 0xd94f6a, 0x4a8fd6, 0xff9a52];

export function buildPartedRiver(scene: THREE.Scene, plastic: PlasticMaterialFactory, opts: { halfGap?: number } = {}): PartedRiverHandle {
  const group = new THREE.Group(); group.name = 'parted-river';
  const gap = opts.halfGap ?? 8;         // medio ancho del cauce seco
  const wallH = 15, zFrom = 22, zTo = -44, len = zFrom - zTo;

  // --- cauce seco (barro/arena húmeda) por el medio ---
  const bed = new THREE.Mesh(new THREE.PlaneGeometry(gap * 2, len), new THREE.MeshStandardMaterial({ color: 0x8a7a52, roughness: 1 }));
  bed.rotation.x = -Math.PI / 2; bed.position.set(0, 0.02, (zFrom + zTo) / 2); bed.receiveShadow = true; group.add(bed);
  // piedras y algas en el cauce
  for (let i = 0; i < 14; i++) {
    const rx = ((i * 53) % (gap * 2 - 2)) - (gap - 1), rz = zFrom - ((i * 91) % len);
    const s = 0.4 + (i % 3) * 0.25;
    group.add(new THREE.Mesh(new THREE.DodecahedronGeometry(s), plastic.get(0x6b675e)).translateX(rx).translateY(s * 0.5).translateZ(rz));
  }

  // --- material de agua translúcida ---
  const waterMat = new THREE.MeshStandardMaterial({ color: 0x2f79c4, transparent: true, opacity: 0.62, roughness: 0.25, metalness: 0.1, side: THREE.DoubleSide });
  const foamMat = new THREE.MeshStandardMaterial({ color: 0xdaeaf5, roughness: 0.7 });

  const fishes: THREE.Object3D[] = [];
  const seeds: number[] = [];

  function wall(sideX: number): void {
    const w = new THREE.Group(); w.position.set(sideX, 0, (zFrom + zTo) / 2);
    // muro de agua (caja translúcida) + estrías verticales
    const slab = new THREE.Mesh(new THREE.BoxGeometry(2.2, wallH, len), waterMat); slab.position.y = wallH / 2; w.add(slab);
    const innerX = -Math.sign(sideX) * 1.0; // cara interior del muro (hacia el cauce)
    for (let s = 0; s < 10; s++) {
      const str = new THREE.Mesh(new THREE.BoxGeometry(0.18, wallH - 1, 0.5), new THREE.MeshStandardMaterial({ color: 0x5fa0da, transparent: true, opacity: 0.4 }));
      str.position.set(innerX, (wallH - 1) / 2, zFrom - 2 - s * (len / 10)); w.add(str);
    }
    // espuma en la base
    const foam = new THREE.Mesh(new THREE.BoxGeometry(2.6, 1.0, len), foamMat); foam.position.y = 0.5; w.add(foam);
    // cresta superior
    w.add(new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.8, len), foamMat).translateY(wallH));
    // PECES dentro del muro (mirando a lo largo, colores vivos)
    for (let i = 0; i < 12; i++) {
      const fy = 2.5 + (i * 37 % 100) / 100 * (wallH - 4);
      const fz = zFrom - 3 - (i * 71 % (len - 6));
      const fish = new THREE.Group();
      const body = new THREE.Mesh(new THREE.SphereGeometry(0.45, 10, 8), plastic.get(FISH_COLORS[i % FISH_COLORS.length])); body.scale.set(1.5, 0.9, 0.6); fish.add(body);
      const tail = new THREE.Mesh(new THREE.ConeGeometry(0.32, 0.6, 4), plastic.get(FISH_COLORS[i % FISH_COLORS.length])); tail.rotation.z = Math.PI / 2; tail.position.x = -0.8; fish.add(tail);
      fish.position.set(-Math.sign(sideX) * 0.4, fy, fz); fish.rotation.y = sideX > 0 ? 0 : Math.PI; // EMBEBIDO en el agua
      w.add(fish); fishes.push(fish); seeds.push((i * 13 % 10) / 10 * Math.PI * 2 + (sideX > 0 ? 0 : 1));
    }
    group.add(w);
  }
  wall(-gap - 1.1);
  wall(gap + 1.1);

  scene.add(group);
  let t = 0;
  return {
    group,
    update(dt: number): void {
      t += dt;
      for (let i = 0; i < fishes.length; i++) {
        const f = fishes[i], s = seeds[i];
        f.position.y += Math.sin(t * 1.5 + s) * dt * 0.6;         // suben/bajan suave
        f.rotation.z = Math.sin(t * 2 + s) * 0.15;                 // coletazo
      }
    },
    dispose(): void {
      scene.remove(group);
      group.traverse((o) => { const m = o as THREE.Mesh; if (m.geometry) m.geometry.dispose(); const mm = m.material as THREE.Material | THREE.Material[] | undefined; if (Array.isArray(mm)) mm.forEach((x) => x.dispose()); else if (mm) mm.dispose(); });
    }
  };
}
