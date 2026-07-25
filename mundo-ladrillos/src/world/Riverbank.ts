import * as THREE from 'three';
import { PlasticMaterialFactory } from '../materials/PlasticMaterialFactory';

/**
 * Vegetación de RIBERA para vestir orillas vacías (p. ej. el Jordán esc.9):
 * matas de juncos, espadañas (totora) y rocas. Autónomo (solo THREE + plastic).
 * `buildReedBed` = una mata; `buildRiverbank` esparce varias a lo largo de una
 * línea de orilla, de forma determinista (estable en resume).
 */

const GREENS = [0x4e7a3a, 0x5f8a3e, 0x6f9b4a, 0x3e6a32];

/** Una mata: juncos altos + un par de espadañas + una roca baja. */
export function buildReedBed(
  plastic: PlasticMaterialFactory,
  o: { x: number; z: number; yaw?: number; count?: number; seed?: number; scale?: number }
): THREE.Group {
  const g = new THREE.Group();
  const seed = o.seed ?? 0;
  const count = o.count ?? 7;
  // Juncos: cañas finas que se abren en abanico
  for (let i = 0; i < count; i++) {
    const k = seed + i;
    const h = 1.5 + (k % 4) * 0.4;
    const col = GREENS[k % GREENS.length];
    const blade = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.06, h, 5), plastic.get(col));
    const a = (i / count) * Math.PI * 2;
    const r = 0.15 + (k % 3) * 0.12;
    blade.position.set(Math.cos(a) * r, h / 2, Math.sin(a) * r);
    blade.rotation.z = Math.cos(a) * 0.18;
    blade.rotation.x = Math.sin(a) * 0.18;
    blade.castShadow = true;
    g.add(blade);
  }
  // Espadañas (totora): tallo + espiga marrón arriba
  for (let j = 0; j < 2; j++) {
    const hx = (j === 0 ? -0.22 : 0.24), hz = (j === 0 ? 0.16 : -0.18);
    const th = 2.1 + ((seed + j) % 2) * 0.4;
    const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.045, th, 6), plastic.get(0x6f8b3a));
    stem.position.set(hx, th / 2, hz); stem.castShadow = true;
    const head = new THREE.Mesh(new THREE.CapsuleGeometry(0.09, 0.34, 4, 8), plastic.get(0x7a4a24));
    head.position.set(hx, th + 0.1, hz);
    g.add(stem, head);
  }
  // Roca baja al pie
  const rock = new THREE.Mesh(new THREE.DodecahedronGeometry(0.42, 0), new THREE.MeshStandardMaterial({ color: 0x8a8276, roughness: 1 }));
  rock.position.set(0.35, 0.18, 0.3); rock.scale.set(1, 0.6, 1); rock.rotation.y = seed; rock.castShadow = true; rock.receiveShadow = true;
  g.add(rock);

  g.position.set(o.x, 0, o.z);
  g.rotation.y = o.yaw ?? 0;
  if (o.scale && o.scale !== 1) g.scale.setScalar(o.scale);
  return g;
}

/**
 * Esparce matas de ribera a lo largo de una línea A→B (la orilla). Determinista.
 * Alterna lados con un pequeño zig-zag para que no queden en fila recta.
 */
export function buildRiverbank(
  plastic: PlasticMaterialFactory,
  o: { ax: number; az: number; bx: number; bz: number; clumps?: number; jitter?: number; seed?: number }
): THREE.Group {
  const g = new THREE.Group();
  const clumps = o.clumps ?? 6;
  const jitter = o.jitter ?? 1.2;
  const seed = o.seed ?? 0;
  const dx = o.bx - o.ax, dz = o.bz - o.az;
  const len = Math.hypot(dx, dz) || 1;
  const nx = -dz / len, nz = dx / len; // normal a la orilla
  for (let i = 0; i < clumps; i++) {
    const u = (i + 0.5) / clumps;
    const side = (i % 2 === 0 ? 1 : -1);
    const off = jitter * side * (0.5 + ((seed + i) % 3) * 0.25);
    const x = o.ax + dx * u + nx * off;
    const z = o.az + dz * u + nz * off;
    g.add(buildReedBed(plastic, {
      x, z, yaw: (seed + i) * 1.3,
      count: 6 + ((seed + i) % 3),
      seed: seed + i * 3,
      scale: 0.85 + ((seed + i) % 3) * 0.12
    }));
  }
  return g;
}
